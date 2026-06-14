export interface RendererHashResult {
  md5: string;
  sha1: string;
  sha256: string;
  size: number;
  durationMs: number;
}

export interface RendererHashProgress {
  requestId: string;
  filePath: string;
  processedBytes: number;
  totalBytes: number;
}

export interface ElectronApi {
  getPathForFile: (file: File) => string;
  hashFile: (filePath: string, requestId: string) => Promise<RendererHashResult>;
  onHashProgress: (
    callback: (progress: RendererHashProgress) => void,
  ) => () => void;
}

declare global {
  interface Window {
    readonly electronAPI: ElectronApi;
  }
}

export {};
