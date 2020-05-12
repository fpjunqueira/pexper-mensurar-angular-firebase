import { Component, OnInit } from '@angular/core';
import { FilesService } from '../files.service';
import { FileEntry } from '../models/file-entry';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {

  files: FileEntry[] = [];

  constructor(private filesService: FilesService) { }

  ngOnInit() {
  }

  // invocado a partir de output emitter no dropzone
  onDropFiles(files: FileList) {
    this.files.splice(0, this.files.length);
    for (let i = 0; i < files.length; i++) {
      // this.filesService.uploadFile(files.item(i));
      this.files.push({
        file: files.item(i),
        percentage: null,
        uploading: null,
        bytesUploaded: null,
        canceled: null,
        error: null,
        finished: null,
        paused: null,
        state: null,
        task: null
      });
    }
  }

  removeFileFromList(i) {
    this.files.splice(i, 1);
  }

  uploadAll() {
    for (const f of this.files) {
      this.filesService.upload(f);
    }
  }
}
