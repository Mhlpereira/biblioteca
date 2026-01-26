#!/bin/sh
set -e

echo "Aguardando MySQL ficar pronto..."
until node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const c = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    await c.end();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
})();
"; do
  echo "MySQL ainda não pronto... tentando novamente em 2s"
  sleep 2
done

echo "Rodando migrations..."
npm run migration:run

echo "Rodando seed..."
npm run seed

echo "Subindo API..."
exec npm run start:prod
