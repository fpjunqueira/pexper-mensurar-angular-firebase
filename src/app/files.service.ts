import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FileEntry } from './models/file-entry';
import { map, catchError, finalize } from 'rxjs/operators';
import { of, from, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore/';
import { AngularFirestoreCollection } from '@angular/fire/firestore/public_api';
import { ProjectFile } from './models/project-file';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private filesCollection: AngularFirestoreCollection<ProjectFile>;

  constructor(private storage: AngularFireStorage,
              private afs: AngularFirestore) {
    this.filesCollection = afs.collection('project-files', ref => ref.orderBy('date', 'desc'));
  }

  /**
   * Upload simples de arquivos no firestorage
   * @param f File
   */
  uploadFile(f: File) {
    const path = `projetos/teste/${f.name}`;
    const task = this.storage.upload(path, f);
    task.snapshotChanges()
      .subscribe(s => console.log(s));
  }
  /**
   * Upload de arquivos com acesso aos estados da operação
   * @param f File Entry
   */
  upload(f: FileEntry) {
    const newFileName = `${(new Date()).getTime()}_${f.file.name}`;
    const path = `projetos/teste/${newFileName}`;
    f.task = this.storage.upload(path, f.file);

    // resolve bug no angular fire
    f.state = f.task.snapshotChanges()
      .pipe(
        map(s => f.task.task.snapshot.state),
        catchError(s => {
          return of(f.task.task.snapshot.state);
        })
      );
    this.fillAttributes(f);

    // salva dados do arquivo no banco
    f.task.snapshotChanges().pipe(
      finalize(() => { // captura o término do observable
        if (f.task.task.snapshot.state === 'success') {
         this.filesCollection.add({
           fileName: f.file.name,
           path,
           date: (new Date()).getTime(),
           size: f.file.size,
           projectId: 'teste',
         });
        }
      })
    )
    .subscribe();

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

  getFiles(): Observable<ProjectFile[]> {
    return this.filesCollection.snapshotChanges()
      .pipe(map(actions => {
        return actions.map(a => {
          const file: ProjectFile = a.payload.doc.data();
          const id = a.payload.doc.id;
          const url = this.storage.ref(file.path).getDownloadURL();
          return {id, ...file, url};
        });
      }));
  }

  deleteFile(f: ProjectFile) {
    this.storage.ref(f.path).delete();
    this.filesCollection.doc(f.id).delete();
  }
}
