import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.css']
})
export class DropzoneComponent implements OnInit {

  isDragingOver = false;

  @Output() droppedFiles = new EventEmitter<FileList>();

  constructor() { }

  ngOnInit() {
  }

  onDragOverEvent(event: DragEvent) {
    event.preventDefault();
    this.isDragingOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragingOver = false;
  }

  onDropEvent(event: DragEvent) {
    event.preventDefault();
    this.droppedFiles.emit(event.dataTransfer.files);
  }
}
