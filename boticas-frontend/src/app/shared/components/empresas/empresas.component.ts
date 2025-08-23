import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Empresa } from '../../models/empresa.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.scss'
})
export class EmpresasComponent {

  empresas: Empresa[] = [];

  constructor(private empresaService: EmpresaService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.empresaService.listar().subscribe(data => (this.empresas = data));
  }

  eliminar(id: number) {
    if (!confirm('¿Seguro?')) return;
    this.empresaService.eliminar(id).subscribe(() => this.cargar());
  }

  toggleActivo(emp: Empresa) {
    this.empresaService
      .toggleActivo(emp.id!, !emp.activo)
      .subscribe(() => this.cargar());
  }
}
