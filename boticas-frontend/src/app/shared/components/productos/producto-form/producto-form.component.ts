import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductosService } from '@app/core/services/productos.service';
import { MaterialModule } from '@app/shared/material.module';

@Component({
  selector: 'app-producto-form',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private svc: ProductosService,
    public ref: MatDialogRef<ProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      stockMin: [0, Validators.min(0)],
      stockMax: [100, Validators.min(0)],
      concentracion: [''],
      forma: [''],
      registroSanitario: [''],
      digemid: [''],
      requiereReceta: [false],
      controlado: [false],
    });

    if (data) this.form.patchValue(data);
  }

  save(): void {
    const obs = this.data
      ? this.svc.actualizar(this.data.id, this.form.value)
      : this.svc.crear({ ...this.form.value, idEmpresa: 1 });

    obs.subscribe(() => this.ref.close());
  }
}
