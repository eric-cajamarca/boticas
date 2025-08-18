import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empresa } from '../../shared/models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  
   private apiUrl = 'http://localhost:4000/api/admin/empresas';

  constructor(private http: HttpClient) {}

  crearEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa, { withCredentials: true });
  }

  obtenerEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl, { withCredentials: true });
  }
}
