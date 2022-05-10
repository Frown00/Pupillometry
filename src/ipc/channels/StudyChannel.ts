import { IpcMainEvent, ipcMain } from 'electron';
import FileStore from '../../main/store/FileStore';
import ConfigRepository from '../../main/store/repository/ConfigRepository';
import StudyRepository, {
  IFile,
  IStudyQuery,
} from '../../main/store/repository/StudyRepository';
import { ChannelNames, IpcChannel, IpcRequest, State } from '../interfaces';
import {
  IPupillometryRequest,
  IPupillometryResponse,
} from './PupillometryChannel';

export interface IStudyRequest extends IpcRequest {
  method:
    | 'create'
    | 'readOne'
    | 'readAll'
    | 'deleteOne'
    | 'updateOne'
    | 'clear';
  query: IStudyQuery;
}

export interface IStudyResponse {
  state: State;
  progress: number;
  result: any;
}

export default class StudyChannel implements IpcChannel {
  private name = ChannelNames.STUDY;

  getName(): string {
    return this.name;
  }

  // eslint-disable-next-line class-methods-use-this
  private emitProcess(
    event: IpcMainEvent,
    params: { responseChannel: string; files: IFile[]; config: IConfig }
  ) {
    const { files, config, responseChannel } = params;
    const processRequest: IPupillometryRequest = {
      method: 'process',
      query: {
        form: {
          config,
          files,
        },
      },
      responseChannel,
    };

    ipcMain.emit(ChannelNames.PUPILLOMETRY, event, processRequest);
  }

  // eslint-disable-next-line class-methods-use-this
  private listenProcess(
    event: IpcMainEvent,
    params: {
      responseChannel: string;
      files: IFile[];
      dataPath: string;
      config: IConfig;
      groupName: string;
      studyName: string;
      isDependant: boolean;
    }
  ) {
    const { files, responseChannel, dataPath, groupName, config, studyName } =
      params;
    let doneCounter = 0;
    ipcMain.on(responseChannel, (_, res: IPupillometryResponse) => {
      if (res.state === State.Loading) {
        doneCounter += 1;
        FileStore.saveFile(res.result[0], dataPath);
        res.progress = doneCounter / files.length;
        event.sender.send(responseChannel, res);
        return;
      }
      StudyRepository.create({
        name: studyName,
        group: groupName,
        select: 'respondent',
        results: res.result,
        form: {
          config,
        },
      });
      const result = <IGroup>(
        StudyRepository.readOne({ name: studyName, group: groupName })
      );
      event.sender.send(responseChannel, {
        result,
        state: State.Done,
        progress: 1,
      });
      ipcMain.removeAllListeners(responseChannel);
    });
  }

  handle(event: IpcMainEvent, request: IStudyRequest): void {
    if (!request.responseChannel) {
      request.responseChannel = `${this.getName()}_response`;
    }
    const response: IStudyResponse = {
      progress: 0,
      state: State.Loading,
      result: null,
    };
    event.sender.send(request.responseChannel, response);
    // Process
    const { query, method } = request;
    if (method === 'create') {
      const config = ConfigRepository.readOne(query.form?.config?.name);
      query.form = {
        ...query.form,
        config,
      };
      if (query.select === 'study') {
        // create study
        const result = <IStudy>StudyRepository.create(query);
      }
      if (query.select === 'group') {
        // create group
        if (!query.name)
          throw new Error('Group must be assigned to some study');
        const newGroup = <IGroup>StudyRepository.create(query);
        // action process respondent data
        if (!query.form.files) throw new Error('Selected zero files');
        const { files } = query.form;
        this.emitProcess(event, {
          responseChannel: request.responseChannel,
          files,
          config,
        });
        const dataPath = FileStore.getDataFolder(query.name, newGroup.name);
        this.listenProcess(event, {
          responseChannel: request.responseChannel,
          files,
          dataPath,
          config,
          groupName: newGroup.name,
          isDependant: newGroup.isDependant,
          studyName: query.name,
        });
        return;
      }
      if (query.select === 'respondent') {
        if (!query.form.files) throw new Error('Selected zero files');
        if (!query.name) throw new Error('No study name');
        if (!query.group) throw new Error('No group name');
        const group = <IGroup>StudyRepository.readOne(query);
        if (!group) throw new Error('No group');
        const { files } = query.form;
        this.emitProcess(event, {
          responseChannel: request.responseChannel,
          files,
          config,
        });
        const dataPath = FileStore.getDataFolder(query.name, query.group);
        this.listenProcess(event, {
          responseChannel: request.responseChannel,
          files,
          dataPath,
          config,
          groupName: group.name,
          isDependant: group.isDependant,
          studyName: query.name,
        });
        return;
      }
    }
    if (method === 'readOne') {
      response.result = StudyRepository.readOne(query);
      if (query.select === 'respondent') {
        if (!query.name) throw new Error('To read respondent pass study name');
        if (!query.group) throw new Error('To read respondent pass group name');
        if (!query.respondent)
          throw new Error('To read respondent pass respondent name');
        const result = <IPupillometryResult>response.result;
        const dataPath = FileStore.getFilePath(
          query.name,
          query.group,
          query.respondent
        );
        response.result = FileStore.readFile(dataPath) || result;
      }
    }
    if (method === 'readAll') response.result = StudyRepository.readAll(query);
    if (method === 'deleteOne') {
      if (!query.name) return;
      if (query.select === 'study') {
        FileStore.removeStudy(query.name);
      }
      if (query.select === 'group') {
        if (!query.group) return;
        FileStore.removeGroup(query.name, query.group);
      }
      if (query.select === 'respondent') {
        if (!query.group) return;
        if (!query.respondent) return;
        FileStore.removeRespondent(query.name, query.group, query.respondent);
      }
      response.result = StudyRepository.deleteOne(query);
    }
    if (method === 'clear') {
      response.result = StudyRepository.clear();
      FileStore.removeAll();
    }
    if (method === 'updateOne') {
      response.result = StudyRepository.updateOne(query);
      const dataPath = FileStore.getDataFolder(query.name, query.group);
      FileStore.saveFile(response.result, dataPath);
    }
    response.progress = 1;
    response.state = State.Done;
    event.sender.send(request.responseChannel, response);
  }
}
