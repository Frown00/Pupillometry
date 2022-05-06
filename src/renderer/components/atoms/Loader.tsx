/* eslint-disable react/require-default-props */
import { Progress, Spin } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import Color from '../../assets/color';
import Text from './Text';

const antIcon = <Loading3QuartersOutlined style={{ fontSize: 100 }} spin />;

const Loader = (props: { color: string }) => {
  const { color } = props;
  return <Spin indicator={antIcon} style={{ color }} />;
};

interface IProps {
  progress?: number;
}

const DefaultLoader = ({ progress }: IProps) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: 'calc(50vh - 100px - 30px)',
        flexDirection: 'column',
      }}
    >
      <Loader color={Color.accent.primary} />
      <div>{progress !== undefined ? `${progress}%` : ''}</div>
      <Text>It may take a while...</Text>
    </div>
  );
};

export const ProgressLoader = ({ progress }: IProps) => (
  <div
    style={{
      position: 'absolute',
      top: '40%',
      left: '50%',
    }}
  >
    <Progress type="circle" percent={progress} />
  </div>
);

export default DefaultLoader;
