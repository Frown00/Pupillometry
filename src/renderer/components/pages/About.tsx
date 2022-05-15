import { Space } from 'antd';
import { StringSchema } from 'yup';
import IpcService from '../../IpcService';
import { IShellRequest } from '../../../ipc/channels/ShellChannel';
import { ChannelNames } from '../../../ipc/interfaces';
import Title from '../atoms/Title';
import General from '../templates/General';
import ShortInformation from '../molecules/ShortInformation';
import Button from '../atoms/Button';

const pjson = require('../../../../package.json');

const ExternalButton = ({ title, href }: { title: string; href: string }) => (
  <Button
    onClick={() => {
      const request: IShellRequest = {
        method: 'open',
        options: {
          href,
        },
      };
      IpcService.send(ChannelNames.SHELL, request);
    }}
  >
    {title}
  </Button>
);

export default function About() {
  return (
    <General>
      <Title level={1}>About</Title>
      <Space direction="vertical" size="large">
        <ShortInformation
          title="Releases"
          content={
            <ExternalButton
              title="Github"
              href="https://github.com/Frown00/Pupillometry/releases"
            />
          }
        />
        <ShortInformation
          title="Documentation PL"
          content={
            <ExternalButton
              title="Link to PDF"
              href="https://github.com/Frown00/Pupillometry/blob/main/assets/docs/Pupillometry_PL.pdf"
            />
          }
        />
        <ShortInformation
          title="Documentation EN"
          content={
            <ExternalButton
              title="Link to PDF"
              href="https://github.com/Frown00/Pupillometry/blob/main/assets/docs/Pupillometry_EN.pdf"
            />
          }
        />
        <ShortInformation title="Current Version" content={pjson.version} />
      </Space>
    </General>
  );
}
