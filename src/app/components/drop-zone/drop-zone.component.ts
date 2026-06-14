import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-drop-zone',
  imports: [MatIconModule],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'button',
    tabindex: '0',
    'aria-label': '拖曳或點擊選擇檔案',
  },
})
export class DropZoneComponent {
  readonly filesDropped = output<File[]>();

  /** When true, render as a slim horizontal bar to free up vertical space. */
  readonly compact = input(false);

  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly isDragging = signal(false);

  @HostBinding('class.is-dragging')
  protected get draggingClass(): boolean {
    return this.isDragging();
  }

  @HostBinding('class.is-compact')
  protected get compactClass(): boolean {
    return this.compact();
  }

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDragging.set(true);
  }

  @HostListener('dragleave', ['$event'])
  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.relatedTarget === null ||
      !(event.currentTarget as HTMLElement).contains(
        event.relatedTarget as Node,
      )
    ) {
      this.isDragging.set(false);
    }
  }

  @HostListener('drop', ['$event'])
  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = this.collectFiles(event.dataTransfer);
    if (files.length > 0) {
      this.filesDropped.emit(files);
    }
  }

  @HostListener('click')
  protected openPicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openPicker();
    }
  }

  protected onPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length > 0) {
      this.filesDropped.emit(files);
    }
    // Reset so picking the same file again still fires a change event.
    input.value = '';
  }

  private collectFiles(dt: DataTransfer | null): File[] {
    if (!dt) {
      return [];
    }

    const collected: File[] = [];
    if (dt.items && dt.items.length > 0) {
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            collected.push(file);
          }
        }
      }
    } else if (dt.files && dt.files.length > 0) {
      for (let i = 0; i < dt.files.length; i++) {
        collected.push(dt.files[i]);
      }
    }
    return collected;
  }
}
