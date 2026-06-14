import { createReadStream, promises as fsp } from 'node:fs';
import { createHash } from 'node:crypto';

export interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  size: number;
  durationMs: number;
}

export interface HashProgress {
  filePath: string;
  processedBytes: number;
  totalBytes: number;
}

export type HashProgressCallback = (progress: HashProgress) => void;

const PROGRESS_THROTTLE_MS = 100;

export async function computeFileHashes(
  filePath: string,
  onProgress: HashProgressCallback,
): Promise<HashResult> {
  const stats = await fsp.stat(filePath);
  if (!stats.isFile()) {
    throw new Error(`Not a regular file: ${filePath}`);
  }

  const totalBytes = stats.size;
  const md5 = createHash('md5');
  const sha1 = createHash('sha1');
  const sha256 = createHash('sha256');

  let processedBytes = 0;
  let lastEmitted = 0;
  const startedAt = Date.now();

  return await new Promise<HashResult>((resolve, reject) => {
    const stream = createReadStream(filePath, { highWaterMark: 1024 * 1024 });

    stream.on('data', (chunk: Buffer | string) => {
      const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      md5.update(buffer);
      sha1.update(buffer);
      sha256.update(buffer);
      processedBytes += buffer.length;

      const now = Date.now();
      if (now - lastEmitted >= PROGRESS_THROTTLE_MS) {
        lastEmitted = now;
        onProgress({ filePath, processedBytes, totalBytes });
      }
    });

    stream.on('end', () => {
      onProgress({ filePath, processedBytes, totalBytes });
      resolve({
        md5: md5.digest('hex'),
        sha1: sha1.digest('hex'),
        sha256: sha256.digest('hex'),
        size: totalBytes,
        durationMs: Date.now() - startedAt,
      });
    });

    stream.on('error', (err) => reject(err));
  });
}
