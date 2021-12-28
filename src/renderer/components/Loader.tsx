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

const DefaultLoader = <Loader type="spin" color="orange" />;

export default DefaultLoader;
