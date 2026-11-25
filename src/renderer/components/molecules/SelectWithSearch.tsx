import { Select } from 'antd';
import type { RouteComponentProps } from 'react-router';

const { Option } = Select;
type History = RouteComponentProps['history'];

function onChange(baseRoute: string, value: string, history: History) {
  if (value) {
    history.push(`${baseRoute}/${value}`);
  }
}

interface IProps {
  optionNames: string[];
  placeholder: string;
  baseRoute: string;
  width: number;
  history: History;
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
      onChange={(value) => {
        if (typeof value === 'string') onChange(baseRoute, value, history);
      }}
      filterOption={(input, option) =>
        String(option?.props.children ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
    >
      {options}
    </Select>
  );
};

export default SelectWithSearch;
