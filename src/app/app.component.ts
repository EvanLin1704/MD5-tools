import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DropZoneComponent } from './components/drop-zone/drop-zone.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { HashStoreService } from './services/hash-store.service';
import { APP_VERSION } from './version';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    DropZoneComponent,
    FileListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly store = inject(HashStoreService);

  protected readonly version = APP_VERSION;
  protected readonly count = this.store.count;
  protected readonly hasEntries = this.store.hasEntries;
  protected readonly busyCount = this.store.busyCount;

  protected onFilesDropped(files: File[]): void {
    if (files.length > 0) {
      this.store.addFiles(files);
    }
  }

  protected onClearAll(): void {
    this.store.clearAll();
  }
}
