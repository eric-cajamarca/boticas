import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/stores/auth.store';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  sidebarOpen = false; 
  title = 'boticas-frontend';

  constructor(private authStore: AuthStore) {
    // Aquí podrías inicializar el store de autenticación si es necesario
    this.authStore.init();

  }

}

