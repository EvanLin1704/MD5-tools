export type FileEntryStatus = 'pending' | 'hashing' | 'done' | 'error';

export interface FileHashes {
  md5: string;
  sha1: string;
  sha256: string;
}

export interface FileEntry {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly size: number;
  status: FileEntryStatus;
  processedBytes: number;
  hashes: FileHashes | null;
  durationMs: number | null;
  errorMessage: string | null;
}
