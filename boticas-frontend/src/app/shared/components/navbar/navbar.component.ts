// src/app/shared/components/navbar/navbar.component.ts
import { Component, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private authStore: AuthStore) {}

  // Usamos la señal directamente
  get currentUser() {
    return this.authStore.user;
  }

  // Computamos la inicial del usuario
  userInitial = computed(() => {
    const user = this.currentUser();
    return user?.email ? user.email.charAt(0).toUpperCase() : '';
  });

}

