FRONTEND_URL=https://app.seudominio.com
KONG_PROXY_URL=https://api.seudominio.com
KEYCLOAK_PUBLIC_URL=https://auth.seudominio.com

# ===== KEYCLOAK =====
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=********
KC_DB_PASSWORD=********
KC_ADMIN_CLIENT_ID=backend
KC_ADMIN_CLIENT_SECRET=********

# ===== KONG =====
KONG_PG_PASSWORD=********

# ===== KONGA =====
KONGA_TOKEN_SECRET=********
KONGA_DB_PASSWORD=********

# ===== MYSQL =====
MYSQL_ROOT_PASSWORD=********
MYSQL_USER=user
MYSQL_PASSWORD=********
MYSQL_DATABASE=biblioteca

# ===== BACKEND =====
NODE_ENV=production
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_USER=user
DATABASE_PASSWORD=********
DATABASE_NAME=biblioteca

# ===== KAFKA =====
KAFKA_BROKERS=kafka:9092

# ===== ELASTIC =====
ELASTIC_URL=http://elasticsearch:9200