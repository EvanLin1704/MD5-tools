import { contextBridge, ipcRenderer, webUtils } from 'electron';
import {
  HASH_CHANNEL,
  HASH_PROGRESS_CHANNEL,
  type HashProgressEvent,
  type HashRequest,
} from './ipc/hash.handler';
import type { HashResult } from './services/hash.service';

export interface ElectronApi {
  getPathForFile: (file: File) => string;
  hashFile: (filePath: string, requestId: string) => Promise<HashResult>;
  onHashProgress: (
    callback: (progress: HashProgressEvent) => void,
  ) => () => void;
}

const api: ElectronApi = {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  hashFile: (filePath, requestId) => {
    const request: HashRequest = { filePath, requestId };
    return ipcRenderer.invoke(HASH_CHANNEL, request);
  },
  onHashProgress: (callback) => {
    const listener = (_event: unknown, progress: HashProgressEvent): void => {
      callback(progress);
    };
    ipcRenderer.on(HASH_PROGRESS_CHANNEL, listener);
    return () => ipcRenderer.off(HASH_PROGRESS_CHANNEL, listener);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
