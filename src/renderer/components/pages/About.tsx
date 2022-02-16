import Title from '../atoms/Title';
import Text from '../atoms/Text';
import General from '../templates/General';

const pjson = require('../../../../package.json');

export default function About() {
  return (
    <General>
      <Title level={1}>About</Title>
      <div>
        <Text>Version: {pjson.version}</Text>
      </div>
    </General>
  );
}
