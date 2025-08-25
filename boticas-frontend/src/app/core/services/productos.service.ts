import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IProducto } from '@app/shared/models/producto.model';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  data: T[];
}

@Injectable({
  providedIn: 'root'
})

export class ProductosService {

  constructor(
    private api: ApiService
  ) {}

  listar(idEmpresa: number): Observable<ApiResponse<IProducto>> {
  return this.api.get<ApiResponse<IProducto>>('/admin/productos', { idEmpresa });
  }
  // listar(idEmpresa: number): Observable<IProducto[]> {
  //   return this.api.get<IProducto[]>('/admin/productos', { idEmpresa });
  // }

  crear(body: Omit<IProducto, 'id'>): Observable<IProducto> {
    return this.api.post<IProducto>('/admin/productos', body);
  }

  actualizar(id: number, body: Partial<IProducto>): Observable<IProducto> {
    return this.api.put<IProducto>(`/admin/productos/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/productos/${id}`);
  }
}
