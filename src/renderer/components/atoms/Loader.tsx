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
}) => {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <ReactLoading type={type} color={color} height="100px" width="100px" />
  );
};

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
      top: 'calc(50vh - 100px - 30px)',
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
