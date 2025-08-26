import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ProductosService } from '@app/core/services/productos.service';
import { IProducto } from '@app/shared/models/producto.model';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/shared/material.module';

@Component({
  selector: 'app-productos-list',
  imports: [CommonModule,MaterialModule,ReactiveFormsModule],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})
export class ProductosListComponent {
  displayedColumns = [
    'codigo',
    'nombre',
    'precioVenta',
    'stockMin',
    'stockMax',
    'actions',
  ];
  dataSource = new MatTableDataSource<IProducto>();
  productos: IProducto[] = [];
  constructor(
    private svc: ProductosService, 
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.svc.listar(1).subscribe({
    next: (res) => {
      console.log('response', res);
      this.dataSource.data = res.data;
    },
    error: (err) => console.error(err),
  });
  //   this.svc.listar(1).subscribe(
  //   response => {
  //     console.log('response', response);
  //     this.productos = response;
  //     this.dataSource.data = response.data;      
  //   },
  //   error => {
  //     console.log(error);
  //   }
  // );
  }

  openForm(producto?: IProducto): void {
    console.log('producto', producto);
    const ref = this.dialog.open(ProductoFormComponent, {
      width: '700px',
      data: producto,
    });
    ref.afterClosed().subscribe(() => this.load());
  }

  delete(idProducto: number): void {
    console.log('delete', idProducto);
    this.svc.eliminar(idProducto).subscribe(() => this.load());
  }
}
