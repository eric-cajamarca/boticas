// src/app/features/productos/models/producto.model.ts
export interface IProducto {
  id: number;
  idEmpresa: number;
  codigo: string;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  idCategoria: number;
  idPresentacion: number;
  idMarca: number;
  idLaboratorio: number;
  idPrincipio: number;
  idVia: number;
  precioCompra: number;
  precioVenta: number;
  stockMin: number;
  stockMax: number;
  concentracion: string;
  forma: string;
  registroSanitario: string;
  digemid: string;
  requiereReceta: boolean;
  controlado: boolean;
}