# Railway Caddy proxy

Routes the public app domain to the right Railway service:

- `/ws/*` → realtime / PartyKit, stripping `/ws`
- everything else → builder

## Railway service

Create a new Railway service with root directory `apps/proxy` and Dockerfile `Dockerfile`.

Set the custom domain (`chatbotx.rapigrowth.org`) on this proxy service, not on builder.

## Required env

```env
BUILDER_URL=http://builder.railway.internal:3000
REALTIME_URL=http://realtime.railway.internal:1999
```

Use the real private Railway hostnames and ports for your services.

## Checks

```bash
curl -i https://chatbotx.rapigrowth.org/healthz
curl -i https://chatbotx.rapigrowth.org/ws/parties/workspaces/test
```

The second command should no longer return the Next.js HTML 404.
