import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';
import { EmpresasComponent } from './shared/components/empresas/empresas.component';
import { ProductosListComponent } from './shared/components/productos/productos-list/productos-list.component';
import { ProductoFormComponent } from './shared/components/productos/producto-form/producto-form.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'empresas',component: EmpresasComponent },
    {
    path: 'admin/empresas',
    children: [
        { path: '', component: EmpresasComponent },

    ]
    },
    {
    path: 'productos',
    children: [
      { path: '', component: ProductosListComponent },
      { path: 'nuevo', component: ProductoFormComponent },
      { path: ':id/editar', component: ProductoFormComponent },
    ],
  },
];
