import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HashStoreService } from '../../services/hash-store.service';
import { FileListItemComponent } from '../file-list-item/file-list-item.component';

@Component({
  selector: 'app-file-list',
  imports: [FileListItemComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent {
  private readonly store = inject(HashStoreService);

  protected readonly entries = this.store.entries;

  protected onRemoved(id: string): void {
    this.store.removeEntry(id);
  }
}
