import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isOpen = false;
  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Productos', icon: '💊', route: '/productos' },
    { label: 'Ventas', icon: '💰', route: '/ventas' },
    { label: 'Clientes', icon: '👥', route: '/clientes' },
    { label: 'Proveedores', icon: '📦', route: '/proveedores' },
    { label: 'Reportes', icon: '📈', route: '/reportes' }
  ];

   @Output() toggleSidebar = new EventEmitter<void>();

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleSidebar.emit();
  }
}


// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';

// @Component({
//   selector: 'app-sidebar',
//   imports: [CommonModule, RouterLink, RouterLinkActive],
//   templateUrl: './sidebar.component.html',
//   styleUrl: './sidebar.component.scss'
// })
// export class SidebarComponent {
//   menuItems = [
//     { label: 'Dashboard', icon: '📊', route: '/dashboard' },
//     { label: 'Productos', icon: '💊', route: '/productos' },
//     { label: 'Ventas', icon: '💰', route: '/ventas' },
//     { label: 'Clientes', icon: '👥', route: '/clientes' },
//     { label: 'Proveedores', icon: '📦', route: '/proveedores' },
//     { label: 'Reportes', icon: '📈', route: '/reportes' }
//   ];
// }
