import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { FileEntry } from '../../models/file-entry.model';
import { formatBytes, formatDuration } from '../../utils/format.util';

interface HashRow {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-file-list-item',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './file-list-item.component.html',
  styleUrl: './file-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListItemComponent {
  private readonly snack = inject(MatSnackBar);

  readonly entry = input.required<FileEntry>();
  readonly removed = output<string>();

  protected readonly progressPercent = computed(() => {
    const e = this.entry();
    if (e.size <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((e.processedBytes / e.size) * 100));
  });

  protected readonly hashRows = computed<readonly HashRow[]>(() => {
    const hashes = this.entry().hashes;
    if (!hashes) {
      return [];
    }
    return [
      { label: 'MD5', value: hashes.md5 },
      { label: 'SHA-1', value: hashes.sha1 },
      { label: 'SHA-256', value: hashes.sha256 },
    ] as const;
  });

  protected readonly sizeLabel = computed(() => formatBytes(this.entry().size));
  protected readonly durationLabel = computed(() =>
    formatDuration(this.entry().durationMs),
  );

  protected onRemove(): void {
    this.removed.emit(this.entry().id);
  }

  protected async onCopy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.snack.open('已複製到剪貼簿', '關閉', { duration: 1500 });
    } catch {
      this.snack.open('複製失敗', '關閉', { duration: 2000 });
    }
  }
}
