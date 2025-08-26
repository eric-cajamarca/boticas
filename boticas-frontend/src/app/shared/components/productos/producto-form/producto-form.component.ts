import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductosService } from '@app/core/services/productos.service';
import { MaterialModule } from '@app/shared/material.module';
import { IProducto } from '@app/shared/models/producto.model';
import { from } from 'rxjs';

@Component({
  selector: 'app-producto-form',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent {
  form: ReturnType<FormBuilder['group']>;
  categorias: any[] = [];
  presentaciones: any[] = [];
  marcas: any[] = [];
  laboratorios: any[] = [];
  principios: any[] = [];
  vias: any[] = [];

  ngOnInit(): void {
    // carga los combos desde tus servicios
    this.loadCombos();
    /* … */
  }

  private loadCombos(): void {
    // Ejemplo:
    // this.categoriaSvc.listar().subscribe(c => this.categorias = c);
    // this.presentacionSvc.listar().subscribe(p => this.presentaciones = p);
    // …lo mismo para marcas, laboratorios, principios, vias
  }

  constructor(
    private fb: FormBuilder,
    private svc: ProductosService,
    public ref: MatDialogRef<ProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    
    this.form = this.fb.group({
      Codigo: [''],
      CodigoBarras: [''],
      Nombre: ['', Validators.required],
      Descripcion: [''],
      PrecioCompra: [0, Validators.required],
      PrecioVenta: [0, Validators.required],
      StockMin: [0],
      StockMax: [0],
      Concentracion: [''],
      Forma: [''],
      RegistroSanitario: [''],
      Digemid: [''],
      RequiereReceta: [false],
      Controlado: [false],
      idCategoria: [null, Validators.required],
      idPresentacion: [null],
      idMarca: [null],
      idLaboratorio: [null],
      idPrincipio: [null],
      idVia: [null]
});


    if (data) this.form.patchValue(data);
  }

  save(): void {
    // 1. combinas form + idEmpresa
  const raw = { ...this.form.value, idEmpresa: 1 };

  // 2. conviertes las claves a minúsculas y aseguras el tipo
  const body: Omit<IProducto, 'id'> = {
    idEmpresa: 1,
    codigo: this.form.value.Codigo,
    codigoBarras: '', // Asigna el valor adecuado si existe en el formulario
    nombre: this.form.value.Nombre,
    descripcion: this.form.value.Descripcion,
    precioCompra: this.form.value.PrecioCompra,
    precioVenta: this.form.value.PrecioVenta,
    stockMin: this.form.value.StockMin,
    stockMax: this.form.value.StockMax,
    concentracion: this.form.value.Concentracion,
    forma: this.form.value.Forma,
    registroSanitario: this.form.value.RegistroSanitario,
    digemid: this.form.value.Digemid,
    requiereReceta: this.form.value.RequiereReceta,
    controlado: this.form.value.Controlado,
    idCategoria: 0,
    idPresentacion: 0,
    idMarca: 0,
    idLaboratorio: 0,
    idPrincipio: 0,
    idVia: 0
  };

  // 3. decides si es crear o actualizar
  const obs = this.data
    ? this.svc.actualizar(this.data.idProducto, body)
    : this.svc.crear(body);

  obs.subscribe(() => this.ref.close());
  }
}
