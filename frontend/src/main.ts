import { bootstrapApplication } from '@angular/platform-browser';
import { provideKeycloak } from 'keycloak-angular';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideKeycloak({
      config: {
        url: 'http://localhost:8081',
        realm: 'biblioteca',
        clientId: 'frontend',
      },
      initOptions: {
        onLoad: 'login-required',           
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      },
    }),
  ],
});