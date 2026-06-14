import { Injectable } from '@angular/core';
import type {
  ElectronApi,
  RendererHashProgress,
  RendererHashResult,
} from '../types/electron-api';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  private readonly api: ElectronApi | undefined =
    typeof window === 'undefined' ? undefined : window.electronAPI;

  get isAvailable(): boolean {
    return this.api !== undefined;
  }

  getPathForFile(file: File): string {
    if (!this.api) {
      throw new Error('Electron API is not available in this context.');
    }
    return this.api.getPathForFile(file);
  }

  hashFile(filePath: string, requestId: string): Promise<RendererHashResult> {
    if (!this.api) {
      return Promise.reject(
        new Error('Electron API is not available in this context.'),
      );
    }
    return this.api.hashFile(filePath, requestId);
  }

  onHashProgress(
    callback: (progress: RendererHashProgress) => void,
  ): () => void {
    if (!this.api) {
      return () => undefined;
    }
    return this.api.onHashProgress(callback);
  }
}
