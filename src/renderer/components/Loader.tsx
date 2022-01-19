/* eslint-disable react/require-default-props */
import { Progress } from 'antd';
import ReactLoading from 'react-loading';

const Loader = ({
  type,
  color,
}: {
  type:
    | 'blank'
    | 'balls'
    | 'bars'
    | 'bubbles'
    | 'cubes'
    | 'cylon'
    | 'spin'
    | 'spinningBubbles'
    | 'spokes';
  color: string;
}) => <ReactLoading type={type} color={color} height="20%" width="20%" />;

interface IProps {
  progress?: number;
}

const DefaultLoader = ({ progress }: IProps) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      top: '50%',
      flexDirection: 'column',
    }}
  >
    <Loader type="spin" color="orange" />
    <div>{progress !== undefined ? `${progress}%` : ''}</div>
  </div>
);

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
