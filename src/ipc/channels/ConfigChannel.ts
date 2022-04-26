import { IpcMainEvent } from 'electron';
import ConfigRepository, {
  IConfigQuery,
} from '../../main/store/repository/ConfigRepository';
import { ChannelNames, IpcChannel, IpcRequest, State } from '../interfaces';

export interface IConfigRequest extends IpcRequest {
  method: 'create' | 'readOne' | 'readAll' | 'deleteOne' | 'deleteMany';
  query: IConfigQuery;
}

export interface IConfigResponse {
  state: State;
  progress: number;
  result: any;
}

export default class ConfigChannel implements IpcChannel {
  private name = ChannelNames.CONFIG;

  getName(): string {
    return this.name;
  }

  handle(event: IpcMainEvent, request: IConfigRequest): void {
    if (!request.responseChannel) {
      request.responseChannel = `${this.getName()}_response`;
    }
    const response: IConfigResponse = {
      progress: 0,
      state: State.Loading,
      result: null,
    };
    event.sender.send(request.responseChannel, response);
    // Process
    const { query, method } = request;
    if (method === 'create') {
      response.result = ConfigRepository.create(query.form);
    }
    if (method === 'readOne')
      response.result = ConfigRepository.readOne(query.name);
    if (method === 'readAll') response.result = ConfigRepository.readAll();
    if (method === 'deleteOne')
      response.result = ConfigRepository.deleteOne(query.name);
    response.progress = 1;
    response.state = State.Done;
    event.sender.send(request.responseChannel, response);
  }
}
