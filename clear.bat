cd C:\Users\Chente\Documents\Pruebas\restartproject

REM 1) Asegúrate de NO usar directUrl si no tienes esa env
REM    (en prisma\schema.prisma deja solo:)
REM datasource db {
REM   provider = "postgresql"
REM   url      = env("DATABASE_URL")
REM }

REM 2) Resetear DB y aplicar migraciones locales (creará la inicial)
npx prisma migrate reset --force --skip-seed --schema .\prisma\schema.prisma

REM 3) Crea tu primera migración "init" (ya contra DB vacía)
npx prisma migrate dev --name init --schema .\prisma\schema.prisma

REM 4) Arranca
npm run dev
