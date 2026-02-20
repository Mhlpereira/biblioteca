import type { KeycloakConfig } from 'keycloak-js';

export const keycloakConfig: KeycloakConfig = {
  url: 'http://localhost:8081',
  realm: 'biblioteca',
  clientId: 'frontend',
};