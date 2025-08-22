import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Productos', icon: '💊', route: '/productos' },
    { label: 'Ventas', icon: '💰', route: '/ventas' },
    { label: 'Clientes', icon: '👥', route: '/clientes' },
    { label: 'Proveedores', icon: '📦', route: '/proveedores' },
    { label: 'Reportes', icon: '📈', route: '/reportes' }
  ];
}
