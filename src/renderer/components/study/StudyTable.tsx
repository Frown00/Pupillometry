/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/state-in-constructor */
import { Table, Button, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

interface IRecord {
  key: string;
  name: string;
  groups: number;
  respondents: number;
}

interface IState {
  filteredInfo: any;
  sortedInfo: any;
}

interface IProps {
  records: IRecord[];
  handleOnDelete: (record: IRecord) => void;
}

export default class StudyTable extends React.Component<IProps, IState> {
  state: IState = {
    filteredInfo: null,
    sortedInfo: null,
  };

  handleChange = (pagination: any, filters: any, sorter: any) => {
    console.log('Various parameters', pagination, filters, sorter);
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

  render() {
    let { sortedInfo, filteredInfo } = this.state;
    const { records, handleOnDelete } = this.props;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: IRecord, b: IRecord) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        },
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ellipsis: true,
        render: (text: IRecord) => (
          <Link to={`/study/${text}`}>
            <div className="link">{text}</div>
          </Link>
        ),
      },
      {
        title: 'Groups',
        dataIndex: 'groups',
        key: 'groups',
        sorter: (a: IRecord, b: IRecord) => a.groups - b.groups,
        sortOrder: sortedInfo.columnKey === 'groups' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Respondents',
        dataIndex: 'respondents',
        key: 'respondents',
        sorter: (a: IRecord, b: IRecord) => a.respondents - b.respondents,
        sortOrder: sortedInfo.columnKey === 'respondents' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'x',
        render: (text: IRecord, record: IRecord) => (
          <Button onClick={() => handleOnDelete(record)}>Delete</Button>
        ),
      },
    ];
    return (
      <>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={this.clearAll}>Clear sorters</Button>
        </Space>
        <Table
          columns={columns}
          pagination={{ pageSize: 3 }}
          dataSource={records}
          onChange={this.handleChange}
        />
      </>
    );
  }
}
