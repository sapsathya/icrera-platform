Icrera Full Scaffold - Postgres + Prisma + S3 Presign + Docker Compose

Overview
--------
This scaffold includes:
- server/: Express server using Prisma (Postgres) and AWS S3 presign URLs.
- client/: React + Vite app with Register/Login/Dashboard/Admin UI.
- docker-compose.yml to run Postgres, server and client locally.

Important: You must provide AWS credentials and S3 bucket to enable presigned uploads.
This repo purpose: development / testing. Review security and hardening before production.

Quick start (Docker)
--------------------
1. Copy `.env.example` in server/ to `server/.env` and fill values (or set environment variables).
2. Create a `.env` in the root with AWS_* variables or export them in your shell.
3. Run:
   docker-compose up --build

Prisma / DB
-----------
After the Postgres container is up, run migrations locally (from host or exec into server container):
  npx prisma migrate dev --name init --schema=server/prisma/schema.prisma

Notes
-----
- The server uses AWS SDK v3 to generate presigned PUT URLs for S3.
- The client will PUT the file directly to the presigned URL, then notify the server of metadata.
- Email verification and password-reset flows are left as TODOs.
- Do not use default secrets in production.

Default admin
-------------
Create an admin user via Prisma Studio or direct DB insert, or modify server to create default admin if none exists.

## New features in v2
- Default admin auto-creation script (server/src/utils/createDefaultAdmin.js)
- Password reset endpoints: POST /api/auth/forgot and POST /api/auth/reset (Prisma PasswordReset model)
- GitHub Actions CI workflow (.github/workflows/ci.yml)

After bringing up the stack, run Prisma migrate to create the PasswordReset table:
  cd server
  npx prisma migrate dev --name add_password_reset --schema=prisma/schema.prisma
