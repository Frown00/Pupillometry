import fs from 'fs';
import os from 'os';
import path from 'path';
import FileStore from '../FileStore';

function waitForSavedResult(filePath: string): Promise<IPupillometryResult> {
  const deadline = Date.now() + 2000;
  let previousContent = '';

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content && content === previousContent) {
          clearInterval(interval);
          resolve(FileStore.readFile(filePath) as IPupillometryResult);
          return;
        }
        previousContent = content;
      }

      if (Date.now() >= deadline) {
        clearInterval(interval);
        reject(
          new Error(`Timed out waiting for FileStore output at ${filePath}`)
        );
      }
    }, 5);
  });
}

describe('FileStore integration', () => {
  let temporaryDirectory: string;

  beforeAll(() => {
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'pupillometry-file-store-')
    );
    FileStore.initialize({ data: { location: temporaryDirectory } });
  });

  afterAll(() => {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('creates nested data folders and resolves respondent paths', () => {
    const dataPath = FileStore.getDataFolder('Study A', 'Group B');

    expect(dataPath).toBe(path.join(temporaryDirectory, 'Study A', 'Group B'));
    expect(fs.statSync(dataPath).isDirectory()).toBe(true);
    expect(
      FileStore.getFilePath('Study A', 'Group B', 'participant.pupil')
    ).toBe(
      path.join(temporaryDirectory, 'Study A', 'Group B', 'participant.pupil')
    );
  });

  it('round-trips an existing result format through the filesystem', async () => {
    const dataPath = FileStore.getDataFolder('Study', 'Group');
    const result: IPupillometryResult = {
      name: 'participant.pupil',
      config: 'Just testing',
      segments: [],
    };

    const savedPath = FileStore.saveFile(result, dataPath);

    expect(savedPath).toBe(path.join(dataPath, result.name));
    expect(await waitForSavedResult(savedPath)).toEqual(result);
  });
});
