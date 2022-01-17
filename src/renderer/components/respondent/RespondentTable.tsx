/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/state-in-constructor */
import { Table, Button, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

interface IRecord {
  key: string;
  name: string;
  validity: string;
  pupilCorrelation: number;
  missing: number;
  min: number;
  max: number;
  mean: number;
  std: number;
}

interface IState {
  sortedInfo: any;
}

interface IProps {
  studyName: string;
  groupName: string;
  records: IRecord[];
  handleOnDelete: (record: IRecord) => void;
}

export default class RespondentTable extends React.Component<IProps, IState> {
  state: IState = {
    sortedInfo: null,
  };

  handleChange = (pagination: any, filters: any, sorter: any) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      sortedInfo: sorter,
    });
  };

  clearAll = () => {
    this.setState({
      sortedInfo: null,
    });
  };

  render() {
    let { sortedInfo } = this.state;
    const { records, handleOnDelete, studyName, groupName } = this.props;
    sortedInfo = sortedInfo || {};
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
          <Link to={`/study/${studyName}/${groupName}/${text}`}>
            <div className="link">{text}</div>
          </Link>
        ),
      },
      {
        title: 'Validity',
        dataIndex: 'validity',
        key: 'validity',
        sorter: (a: IRecord, b: IRecord) => {
          if (a.validity < b.validity) return -1;
          if (a.validity > b.validity) return 1;
          return 0;
        },
        sortOrder: sortedInfo.columnKey === 'validity' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Missing',
        dataIndex: 'missing',
        key: 'missing',
        sorter: (a: IRecord, b: IRecord) => a.missing - b.missing,
        sortOrder: sortedInfo.columnKey === 'missing' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Pupil Correlation',
        dataIndex: 'pupilCorrelation',
        key: 'pupilCorrelation',
        sorter: (a: IRecord, b: IRecord) =>
          a.pupilCorrelation - b.pupilCorrelation,
        sortOrder:
          sortedInfo.columnKey === 'pupilCorrelation' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Min',
        dataIndex: 'min',
        key: 'min',
        sorter: (a: IRecord, b: IRecord) => a.min - b.min,
        sortOrder: sortedInfo.columnKey === 'min' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Max',
        dataIndex: 'max',
        key: 'max',
        sorter: (a: IRecord, b: IRecord) => a.max - b.max,
        sortOrder: sortedInfo.columnKey === 'max' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Mean',
        dataIndex: 'mean',
        key: 'mean',
        sorter: (a: IRecord, b: IRecord) => a.mean - b.mean,
        sortOrder: sortedInfo.columnKey === 'mean' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Std',
        dataIndex: 'std',
        key: 'std',
        sorter: (a: IRecord, b: IRecord) => a.std - b.std,
        sortOrder: sortedInfo.columnKey === 'std' && sortedInfo.order,
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
          pagination={{ pageSize: 5 }}
          dataSource={records}
          onChange={this.handleChange}
        />
      </>
    );
  }
}
