const pjson = require('../../../package.json');

export default function Abeout() {
  // const { name } = props;
  document.title = `Pupillometry > About`;
  return (
    <div>
      <h1>About</h1>
      <div>
        <span>Version: {pjson.version}</span>
      </div>
    </div>
  );
}
