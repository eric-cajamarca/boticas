import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/stores/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'boticas-frontend';

  constructor(private authStore: AuthStore) {
    // Aquí podrías inicializar el store de autenticación si es necesario
    this.authStore.init();

  }
}
