import { Select } from 'antd';

const { Option } = Select;

function onChange(baseRoute: string, value: string, history: any) {
  if (value) {
    history.push(`${baseRoute}/${value}`);
  }
}

function onSearch(val: any) {}

interface IProps {
  optionNames: string[];
  placeholder: string;
  baseRoute: string;
  width: number;
  history: any;
}

const SelectWithSearch = (props: IProps) => {
  const { optionNames, history, baseRoute, placeholder, width } = props;
  const options = optionNames.map((n) => (
    <Option key={n} value={n}>
      {n}
    </Option>
  ));
  return (
    <Select
      style={{ width: `${width}px` }}
      showSearch
      placeholder={placeholder}
      optionFilterProp="children"
      onChange={(v: string) => onChange(baseRoute, v, history)}
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
