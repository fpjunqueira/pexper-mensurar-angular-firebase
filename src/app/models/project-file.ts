import { Observable } from 'rxjs';

export interface ProjectFile {
    // TODO: deixar obrigatório
    projectId?: string;
    fileName: string;
    size: number;
    date: number;
    path: string;
    id?: string;
    url?: Observable<string>;
}
