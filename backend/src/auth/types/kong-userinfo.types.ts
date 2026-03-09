interface KongUserinfo {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  cpf?: string; 
}