import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';
import { EmpresasComponent } from './shared/components/empresas/empresas.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'empresas',component: EmpresasComponent },
    {
    path: 'admin/empresas',
    children: [
        { path: '', component: EmpresasComponent },

    ]
    }
];
