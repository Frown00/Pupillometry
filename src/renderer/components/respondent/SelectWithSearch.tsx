import { Select } from 'antd';

const { Option } = Select;

function onChange(value: any, history: any, params: any) {
  if (value) {
    history.push(`/study/${params.name}/${params.groupName}/${value}`);
  }
  console.log(`selected ${value}`);
}

function onSearch(val: any) {
  console.log('search:', val);
}

interface IProps {
  names: string[];
  history: any;
  params: any;
}

const SelectWithSearch = (props: IProps) => {
  const { names, history, params } = props;
  const options = names.map((n) => (
    <Option key={n} value={n}>
      {n}
    </Option>
  ));
  return (
    <Select
      style={{ minWidth: '100px' }}
      showSearch
      placeholder="Select a respondent"
      optionFilterProp="children"
      onChange={(v) => onChange(v, history, params)}
      onSearch={onSearch}
      filterOption={(input, option: any) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {options}
    </Select>
  );
};

export default SelectWithSearch;
