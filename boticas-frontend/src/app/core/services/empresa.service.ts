// src/app/core/services/empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../../shared/models/empresa.model';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl : any;

  constructor(
    private http: HttpClient,
    private global: GlobalService
  ) {
     this.apiUrl = `${this.global.apiUrl}/admin/empresas`;
  }

  
  listar(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl, {  withCredentials: true  });
  }

  crear(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa, {  withCredentials: true  });
  }

  actualizar(id: number, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa, {  withCredentials: true  });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {  withCredentials: true  });
  }

  toggleActivo(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/disable`, { activo }, {  withCredentials: true  });
  }
}