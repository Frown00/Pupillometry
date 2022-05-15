import { Space } from 'antd';
import Text from '../atoms/Text';

interface IProps {
  title: string;
  content: JSX.Element | string;
}

const ShortInformation = (props: IProps) => {
  const { title, content } = props;
  return (
    <Space direction="vertical">
      <Text color="rgba(0, 0, 0, 0.45)">{title}</Text>
      <Text size="1.4rem" strong>
        {content}
      </Text>
    </Space>
  );
};

export default ShortInformation;
