import { ipcMain, type WebContents } from 'electron';
import {
  computeFileHashes,
  type HashProgress,
  type HashResult,
} from '../services/hash.service';

export const HASH_CHANNEL = 'file:hash';
export const HASH_PROGRESS_CHANNEL = 'file:hash:progress';

export interface HashRequest {
  filePath: string;
  requestId: string;
}

export type HashProgressEvent = HashProgress & { requestId: string };

export function registerHashHandlers(): void {
  ipcMain.handle(
    HASH_CHANNEL,
    async (event, request: HashRequest): Promise<HashResult> => {
      const sender: WebContents = event.sender;
      const { filePath, requestId } = request;
      return computeFileHashes(filePath, (progress) => {
        if (!sender.isDestroyed()) {
          const payload: HashProgressEvent = { ...progress, requestId };
          sender.send(HASH_PROGRESS_CHANNEL, payload);
        }
      });
    },
  );
}
