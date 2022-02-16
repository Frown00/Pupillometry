import { Table as AntdTable, Button, Space } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React from 'react';
import styled from 'styled-components';
import RouteLink from '../atoms/RouteLink';
import color from '../../assets/color';

export type IRecord = { [key: string]: number | string };

interface IAction {
  name: string;
  handler: (record: IRecord) => void;
}

interface IState {
  filteredInfo: any;
  sortedInfo: any;
}

interface IProps {
  records: IRecord[];
  baseRoute: string;
  pageSize?: number;
  handleOnDelete?: (record: IRecord) => void;
}

const TableLink = styled.div`
  color: ${color.font.dark};
  width: 100%;
  &:hover {
    color: ${color.accent.secondary};
  }
`;

export default class Table extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.buildTableColumns = this.buildTableColumns.bind(this);
  }

  handleChange = (pagination: any, filters: any, sorter: any) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  };

  buildTableColumns(record: IRecord, baseRoute: string, actions: IAction[]) {
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const col: ColumnsType<IRecord> = [];
    const stringSorter = (a: IRecord, b: IRecord, key: string) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    };
    const numberSorter = (a: IRecord, b: IRecord, k: string) =>
      parseFloat(a[k]?.toString()) - parseFloat(b[k]?.toString());

    Object.keys(record).forEach((key) => {
      if (key === 'key') {
        //
      } else {
        const isString = typeof record[key] === 'string';
        const sorter = isString ? stringSorter : numberSorter;
        const c: any = {
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          key,
          sorter: (a: IRecord, b: IRecord) => sorter(a, b, key),
          sortOrder: sortedInfo.columnKey === key && sortedInfo.order,
          ellipsis: true,
        };
        if (key.toLowerCase() === 'name') {
          c.render = (text: string) => {
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
    const columnActions: any = {
      title: 'Action',
      dataIndex: 'actions',
      key: 'actions',
    };
    for (let i = 0; i < actions.length; i += 1) {
      const action = actions[i];
      if (action.name === 'delete') {
        columnActions.render = (text: string, rec: IRecord) => (
          <Button onClick={() => action.handler(rec)}>Delete</Button>
        );
      }
    }
    col.push(columnActions);

    return col;
  }

  render() {
    const { records, pageSize, baseRoute, handleOnDelete } = this.props;
    const actions = [];
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
