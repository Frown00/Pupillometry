/* eslint-disable react/require-default-props */
import { Table as AntdTable, Button, Space } from 'antd';
import { ColumnType, ColumnsType, TableProps } from 'antd/lib/table';
import type { SorterResult } from 'antd/lib/table/interface';
import React from 'react';
import styled from 'styled-components';
import RouteLink from '../atoms/RouteLink';
import color from '../../assets/color';

export interface IRecord {
  [key: string]: number | string;
  key: string;
  name: string;
}

interface IAction<T extends IRecord> {
  name: string;
  handler: (record: T) => void;
}

interface IState<T extends IRecord> {
  sortedInfo: SorterResult<T> | null;
}

interface IProps<T extends IRecord> {
  records: T[];
  baseRoute: string;
  pageSize?: number;
  handleOnDelete?: (record: T) => void;
}

const TableLink = styled.div`
  color: ${color.font.dark};
  width: 100%;
  &:hover {
    color: ${color.accent.secondary};
  }
`;

export default class Table<T extends IRecord> extends React.Component<
  IProps<T>,
  IState<T>
> {
  constructor(props: IProps<T>) {
    super(props);
    this.state = {
      sortedInfo: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.buildTableColumns = this.buildTableColumns.bind(this);
  }

  handleChange: NonNullable<TableProps<T>['onChange']> = (
    _pagination,
    _filters,
    sorter
  ) => {
    const sortedInfo = Array.isArray(sorter) ? sorter[0] ?? null : sorter;
    this.setState({ sortedInfo });
  };

  clearAll = () => {
    this.setState({ sortedInfo: null });
  };

  buildTableColumns(record: T, baseRoute: string, actions: IAction<T>[]) {
    const { sortedInfo } = this.state;
    const col: ColumnsType<T> = [];
    const stringSorter = (a: T, b: T, key: string) =>
      String(a[key]).localeCompare(String(b[key]));
    const numberSorter = (a: T, b: T, k: string) =>
      parseFloat(a[k]?.toString()) - parseFloat(b[k]?.toString());

    Object.keys(record).forEach((key) => {
      if (key === 'key') {
        //
      } else {
        const isString = typeof record[key] === 'string';
        const sorter = isString ? stringSorter : numberSorter;
        const c: ColumnType<T> = {
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          key,
          sorter: (a: T, b: T) => sorter(a, b, key),
          sortOrder: sortedInfo?.columnKey === key ? sortedInfo.order : null,
          ellipsis: true,
        };
        if (key.toLowerCase() === 'name') {
          c.render = (text) => {
            return (
              <RouteLink
                to={`${baseRoute}${text}`}
                label={text}
                Wrapper={TableLink}
              />
            );
          };
        }
        col.push(c);
      }
    });
    if (!actions?.length) return col;
    const columnActions: ColumnType<T> = {
      title: 'Action',
      dataIndex: 'actions',
      key: 'actions',
    };
    actions.forEach((action) => {
      if (action.name === 'delete') {
        columnActions.render = (_text, rec) => (
          <Button onClick={() => action.handler(rec)}>Delete</Button>
        );
      }
    });
    col.push(columnActions);

    return col;
  }

  render() {
    const { records, pageSize, baseRoute, handleOnDelete } = this.props;
    const actions: IAction<T>[] = [];
    const record = records?.[0] ?? null;
    if (handleOnDelete)
      actions.push({ name: 'delete', handler: handleOnDelete });
    const columns = record
      ? this.buildTableColumns(record, baseRoute, actions)
      : [];
    return (
      <>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={this.clearAll}>Clear sorters</Button>
        </Space>
        <AntdTable
          columns={columns}
          pagination={{ pageSize }}
          dataSource={records}
          onChange={this.handleChange}
        />
      </>
    );
  }
}
