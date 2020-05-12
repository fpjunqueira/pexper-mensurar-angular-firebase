import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FileEntry } from './models/file-entry';
import { map, catchError } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private storage: AngularFireStorage) { }

  /**
   * 
   * @param f Upload de arquivo no firestorage
   */
  uploadFile(f: File) {
    const path = `projetos/teste/${f.name}`;
    const task = this.storage.upload(path, f);
    task.snapshotChanges()
      .subscribe(s => console.log(s));
  }

  upload(f: FileEntry) {
    const newFileName = `${(new Date()).getTime()}_${f.file.name}`;
    const path = `projetos/teste/${newFileName}`;
    f.task = this.storage.upload(path, f.file);

    // resolve bug no angular fire
    f.state = f.task.snapshotChanges()
      .pipe(
        map(s => f.task.task.snapshot.state),
        catchError( s => {
          return of(f.task.task.snapshot.state);
        })
      );
    this.fillAttributes(f);
  }

  fillAttributes(f: FileEntry) {
    f.percentage = f.task.percentageChanges();
    f.uploading = f.state.pipe(map((s) => s === 'running'));
    // Ver se bug persiste nas novas versões do angular fire
    // state não é preenchido corretamente quando upload é finalizado
    f.finished = from(f.task).pipe(map((s) => s.state === 'success'));
    f.paused = f.state.pipe(map((s) => s === 'paused'));
    f.error = f.state.pipe(map((s) => s === 'error'));
    f.canceled = f.state.pipe(map((s) => s === 'canceled'));
    f.bytesUploaded = f.task.snapshotChanges().pipe((map(s => s.bytesTransferred)));
  }
}
