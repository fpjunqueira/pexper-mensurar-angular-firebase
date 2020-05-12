import { Observable } from 'rxjs';

export interface ProjectFile {
    fileName; string;
    size: number;
    date: number;
    path: string;
    id?: string;
    url?: Observable<string>;
}
