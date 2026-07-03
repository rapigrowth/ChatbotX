# Railway + Cloudflare deployment

Target topology:

- `chatbotx.rapigrowth.org` -> Railway `builder`
- `mcp.chatbotx.rapigrowth.org` -> Railway `mcp-server`
- `realtime.chatbotx.rapigrowth.org` -> Cloudflare PartyKit
- `storage.chatbotx.rapigrowth.org` -> Cloudflare R2
- Railway private services: `worker`, Redis, Timescale/Postgres

## 0. Branch

```bash
git checkout deploy/railway-timescale
git push -u origin deploy/railway-timescale
```

## 1. Generate secrets

```bash
openssl rand -base64 32 # BETTER_AUTH_SECRET
openssl rand -hex 32    # ENCRYPTION_KEY
openssl rand -base64 32 # REALTIME_BROADCAST_SECRET
```

Keep `REALTIME_BROADCAST_SECRET` identical in `builder`, `worker`, and
PartyKit.

## 2. Cloudflare DNS names

Create/use these names:

```text
chatbotx.rapigrowth.org
mcp.chatbotx.rapigrowth.org
realtime.chatbotx.rapigrowth.org
storage.chatbotx.rapigrowth.org
```

Railway will give CNAME targets for `chatbotx` and `mcp`. PartyKit will attach
`realtime`. R2 will attach `storage`.

## 3. R2 storage

In Cloudflare:

1. Create R2 bucket, for example `chatbotx`.
2. Create an R2 API token with object read/write for that bucket.
3. Add custom domain `storage.chatbotx.rapigrowth.org` to the bucket.

Set on Railway `builder` and `worker`:

```env
S3_ACCESS_KEY_ID=<r2-access-key>
S3_SECRET_ACCESS_KEY=<r2-secret-key>
S3_BUCKET=chatbotx
S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
NEXT_PUBLIC_STORAGE_URL=https://storage.chatbotx.rapigrowth.org/
```

## 4. Timescale/Postgres on Railway

Create a Railway service from Docker image:

```text
timescale/timescaledb-ha:pg18-all
```

Add a persistent volume:

```text
/home/postgres/pgdata
```

Set variables:

```env
POSTGRES_DB=chatbotx
POSTGRES_USER=chatbotx
POSTGRES_PASSWORD=<strong-password>
```

After it boots, connect with psql and run:

```sql
create extension if not exists timescaledb cascade;
create extension if not exists vector;
create extension if not exists btree_gist;
```

Use the private/internal Railway host in `DATABASE_URL` for app services.

## 5. Redis on Railway

Add Railway Redis. Copy its `REDIS_URL` into `builder` and `worker`.

## 6. Builder on Railway

Create a Railway GitHub service from this repo/branch.

Settings:

```text
Root Directory: /
Config file: /railway.toml
Domain: chatbotx.rapigrowth.org
```

Variables:

```env
NEXT_PUBLIC_EDITION=community
PLATFORM_ADMIN_EMAIL=<admin@email>
BETTER_AUTH_SECRET=<generated-base64-secret>
BETTER_AUTH_URL=https://chatbotx.rapigrowth.org
NEXT_PUBLIC_BUILDER_URL=https://chatbotx.rapigrowth.org
NEXT_PUBLIC_INTERNAL_WS_URL=https://realtime.chatbotx.rapigrowth.org
DATABASE_URL=postgresql://chatbotx:<password>@<timescale-private-host>:5432/chatbotx?schema=public
REDIS_URL=<railway-redis-url>
SMTP_SERVER=<smtp-url>
SMTP_FROM=<from-email>
ENCRYPTION_KEY=<generated-hex-key>
REALTIME_BROADCAST_SECRET=<shared-realtime-secret>
LOG_LEVEL=info
```

First deploy only:

```env
RUN_DB_MIGRATE=true
RUN_DB_SEED=true
```

After first successful boot, remove both or set:

```env
RUN_DB_MIGRATE=false
RUN_DB_SEED=false
```

## 7. Worker on Railway

Create a second Railway GitHub service from the same repo/branch.

Settings:

```text
Root Directory: /
Config file: /railway/worker.toml
No public domain needed
```

Use the same variables as `builder`, except no custom domain is needed.

## 8. PartyKit realtime on Cloudflare

Create a Cloudflare API token using the `Edit Cloudflare Workers` template.
It needs access to the `rapigrowth.org` zone.

From local repo:

```bash
cd apps/realtime

REALTIME_BROADCAST_SECRET='<shared-realtime-secret>' \
CLOUDFLARE_ACCOUNT_ID='<cloudflare-account-id>' \
CLOUDFLARE_API_TOKEN='<workers-api-token>' \
pnpm exec partykit env push

CLOUDFLARE_ACCOUNT_ID='<cloudflare-account-id>' \
CLOUDFLARE_API_TOKEN='<workers-api-token>' \
pnpm exec partykit deploy --domain realtime.chatbotx.rapigrowth.org
```

Then confirm builder has:

```env
NEXT_PUBLIC_INTERNAL_WS_URL=https://realtime.chatbotx.rapigrowth.org
```

## 9. MCP server on Railway

Create a third Railway GitHub service from the same repo/branch.

Settings:

```text
Root Directory: /
Config file: /railway/mcp-server.toml
Domain: mcp.chatbotx.rapigrowth.org
```

Variables:

```env
CHATBOTX_API_URL=https://chatbotx.rapigrowth.org
CHATBOTX_API_KEY=<create-from-chatbotx-ui-or-db>
CHATBOTX_MCP_TRANSPORT=sse
CHATBOTX_MCP_HOST=0.0.0.0
CHATBOTX_MCP_SSE_PATH=/sse
CHATBOTX_MCP_MESSAGES_PATH=/messages
CHATBOTX_MCP_CORS_ORIGIN=*
CHATBOTX_MCP_SERVER_NAME=ChatbotX Rapigrowth
```

Do not set `CHATBOTX_MCP_PORT` unless needed. The Docker entrypoint maps
Railway `PORT` to `CHATBOTX_MCP_PORT`.

MCP SSE URL:

```text
https://mcp.chatbotx.rapigrowth.org/sse
```

## 10. Smoke checks

```bash
curl -fsS https://chatbotx.rapigrowth.org/api/health
curl -fsS https://mcp.chatbotx.rapigrowth.org/sse
```

Then test:

1. Login at `https://chatbotx.rapigrowth.org`.
2. Upload a file and verify it lands in R2.
3. Open two browser windows and verify realtime inbox/chat updates.
4. Connect an MCP client to `https://mcp.chatbotx.rapigrowth.org/sse`.

## 11. Backup minimum

Do not keep real customer data without a restore-tested backup. Minimum lazy
path: scheduled `pg_dump` to R2 daily, plus one manual restore test.
