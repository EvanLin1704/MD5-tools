import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import type { FileEntry } from '../models/file-entry.model';
import { ElectronService } from './electron.service';

interface DroppedFile {
  readonly file: File;
  readonly path: string;
}

/** Hash at most this many files at once to avoid saturating disk I/O. */
const MAX_CONCURRENT_HASHES = 4;

@Injectable({ providedIn: 'root' })
export class HashStoreService {
  private readonly electron = inject(ElectronService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _entries = signal<FileEntry[]>([]);

  private readonly queue: string[] = [];
  private activeCount = 0;

  readonly entries = this._entries.asReadonly();
  readonly count = computed(() => this._entries().length);
  readonly hasEntries = computed(() => this._entries().length > 0);
  readonly busyCount = computed(
    () =>
      this._entries().filter(
        (e) => e.status === 'pending' || e.status === 'hashing',
      ).length,
  );

  constructor() {
    if (this.electron.isAvailable) {
      const off = this.electron.onHashProgress((progress) => {
        this.applyProgress(progress.requestId, progress.processedBytes);
      });
      this.destroyRef.onDestroy(off);
    }
  }

  addFiles(files: readonly File[]): void {
    if (!this.electron.isAvailable || files.length === 0) {
      return;
    }

    const incoming: DroppedFile[] = [];
    for (const file of files) {
      try {
        const path = this.electron.getPathForFile(file);
        if (path) {
          incoming.push({ file, path });
        }
      } catch {
        // Ignore files we can't resolve a path for (e.g. virtual items).
      }
    }
    if (incoming.length === 0) {
      return;
    }

    const newEntries: FileEntry[] = incoming.map(({ file, path }) => ({
      id: this.makeId(),
      name: file.name,
      path,
      size: file.size,
      status: 'pending',
      processedBytes: 0,
      hashes: null,
      durationMs: null,
      errorMessage: null,
    }));

    this._entries.update((current) => [...current, ...newEntries]);

    for (const entry of newEntries) {
      this.queue.push(entry.id);
    }
    this.pumpQueue();
  }

  removeEntry(id: string): void {
    this._entries.update((current) => current.filter((e) => e.id !== id));
  }

  clearAll(): void {
    this._entries.set([]);
  }

  private pumpQueue(): void {
    while (this.activeCount < MAX_CONCURRENT_HASHES && this.queue.length > 0) {
      const id = this.queue.shift();
      if (id === undefined) {
        break;
      }
      this.activeCount++;
      void this.processEntry(id).finally(() => {
        this.activeCount--;
        this.pumpQueue();
      });
    }
  }

  private async processEntry(id: string): Promise<void> {
    const entry = this.findEntry(id);
    if (!entry) {
      return;
    }
    this.patchEntry(id, { status: 'hashing' });

    try {
      const result = await this.electron.hashFile(entry.path, id);
      this.patchEntry(id, {
        status: 'done',
        processedBytes: result.size,
        hashes: {
          md5: result.md5,
          sha1: result.sha1,
          sha256: result.sha256,
        },
        durationMs: result.durationMs,
      });
    } catch (err) {
      this.patchEntry(id, {
        status: 'error',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private applyProgress(requestId: string, processedBytes: number): void {
    this._entries.update((current) =>
      current.map((entry) =>
        entry.id === requestId && entry.status === 'hashing'
          ? { ...entry, processedBytes }
          : entry,
      ),
    );
  }

  private patchEntry(id: string, patch: Partial<FileEntry>): void {
    this._entries.update((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  }

  private findEntry(id: string): FileEntry | undefined {
    return this._entries().find((e) => e.id === id);
  }

  private makeId(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
