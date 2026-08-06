# Production deployment with Caddy

## Goal

Prepare the root `docker-compose.yml` for deployment to a single VPS. Caddy
must be the only public entry point. PostgreSQL, the backend, and the frontend
must be reachable only through the Docker network.

## Architecture

All services join the existing `kanbanchik` bridge network. PostgreSQL exposes
port 5432 only inside that network. The backend listens on container port 3001,
and the frontend listens on container port 3000; neither service publishes a
host port.

Caddy publishes TCP ports 80 and 443 and UDP port 443. It routes requests whose
path begins with `/api/` to `backend:3001` without stripping the path, and sends
all other requests to `frontend:3000`. The browser therefore uses the
same-origin API base URL `/api/v1`.

## Caddy configuration

The repository will contain a `Caddyfile`. Its site address comes from an
environment variable passed to the Caddy container. The initial value is `:80`,
which serves plain HTTP on the VPS IP address without requiring a domain.

When a domain becomes available, the operator will:

1. Create DNS A and, when applicable, AAAA records pointing to the VPS.
2. Set the Caddy site address to the domain name.
3. Set application public URLs and allowed origins to the corresponding HTTPS
   URL.
4. Allow inbound ports 80 and 443 in the VPS firewall.
5. Recreate the affected containers.

Caddy will then obtain and renew a publicly trusted TLS certificate. Named
volumes will persist Caddy certificate data and runtime configuration across
container recreation.

## Compose changes

- Remove the PostgreSQL `ports` mapping. Database consumers use the service
  hostname `postgres` and port 5432.
- Remove the backend and frontend `ports` mappings.
- Keep the backend container on a fixed internal port 3001 so the proxy target
  is independent of obsolete host-port variables.
- Add the Caddy service, its public port mappings, its read-only `Caddyfile`
  mount, and persistent data/config volumes.
- Make Caddy start after the frontend and backend services have started.
- Retain restart policies and the PostgreSQL health-gated backend dependency.

No host binding to ports 5432, 3001, or 3000 may remain in the production
compose model.

## Environment defaults

The root `.env.example` will document the Caddy site address and same-origin
frontend API URL. Production examples will disable demo seeding and will make
clear that database passwords and the JWT secret must be replaced before
deployment. Host-port variables that are no longer consumed by the compose
file will be removed from the example.

## Deployment documentation

The project documentation will explain:

- VPS prerequisites and required inbound firewall ports;
- creation and validation of the production `.env` file;
- building, starting, inspecting, and updating the stack;
- confirming that only Caddy has host port mappings;
- accessing the initial deployment by IP over HTTP;
- configuring DNS and switching to automatic HTTPS later;
- the need to back up the PostgreSQL and Caddy data volumes.

The documentation will not present the local-only infrastructure compose file
as suitable for production because it intentionally publishes PostgreSQL.

## Failure behavior

If the frontend or backend is unavailable, Caddy returns an upstream error and
does not bypass Docker network isolation. The backend remains gated on a healthy
PostgreSQL service. TLS issuance failures do not expose private service ports;
operators diagnose them from Caddy logs and verify DNS and firewall settings.

## Verification

The completed change will be checked by rendering the effective configuration
with `docker compose config`. The rendered services must show public port
mappings only for Caddy. The Caddy configuration will be validated with the
Caddy image when Docker is available. Existing application tests or builds are
not changed by this configuration-only work; targeted checks will confirm that
the frontend build receives `/api/v1` as its public API URL.
