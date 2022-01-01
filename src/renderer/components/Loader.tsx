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

const DefaultLoader = () => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      top: '50%',
    }}
  >
    <Loader type="spin" color="orange" />
  </div>
);

export default DefaultLoader;
