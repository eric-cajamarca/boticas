import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthStore } from './core/stores/auth.store';


export function initAuth(store: AuthStore) {
  return () => store.init();
}
export const appConfig: ApplicationConfig = {
  providers: [
              provideZoneChangeDetection({ eventCoalescing: true }), 
              provideRouter(routes),
              provideHttpClient(withFetch(),
              withInterceptors([authInterceptor])),
              {
                provide: APP_INITIALIZER,
                useFactory: initAuth,
                deps: [AuthStore],
                multi: true
              }
            ]
            
};
