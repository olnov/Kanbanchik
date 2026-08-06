# Deploy Kanbanchik to a VPS

The root `docker-compose.yml` runs the production-oriented stack behind Caddy.
Caddy is the only service that publishes host ports. PostgreSQL, the backend,
and the frontend remain reachable only through the private Docker network.

## Prerequisites

Prepare a Linux VPS with:

- Docker Engine and the Docker Compose plugin;
- Git;
- enough disk space for images, database data, and backups;
- inbound TCP 22 for SSH, TCP 80 and TCP 443 for web traffic, and UDP 443 for
  HTTP/3.

Do not create public firewall rules for ports 3000, 3001, or 5432. If using
UFW, confirm that SSH access works before enabling it, then allow the web ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
sudo ufw status
```

Apply equivalent rules in the VPS provider's network firewall or security
group.

## Initial deployment by IP address

Clone the repository, enter it, and create the production environment file:

```bash
git clone <repository-url> kanbanchik
cd kanbanchik
cp .env.example .env
chmod 600 .env
```

Edit `.env` before starting the stack. At minimum:

- replace `POSTGRES_PASSWORD` and update that password in both database URLs;
- replace `JWT_SECRET` with a long random value;
- keep `AUTO_SEED_DEMO=false` unless demo data is intentionally required;
- keep `CADDY_SITE_ADDRESS=:80` while no domain is available;
- keep `NEXT_PUBLIC_API_URL=/api/v1`;
- set `FRONTEND_URL=http://<VPS_PUBLIC_IP>`;
- include `http://<VPS_PUBLIC_IP>` in `CORS_ORIGINS`;
- configure optional Mattermost, GitLab, and AI-provider values as required.

For example, generate secrets without writing them to shell history:

```bash
openssl rand -base64 32
```

Render the effective Compose model before starting it. The rendered output can
contain secrets, so do not paste it into public logs or tickets.

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

Open `http://<VPS_PUBLIC_IP>`. The API is available at
`http://<VPS_PUBLIC_IP>/api/v1`, and Swagger is available at
`http://<VPS_PUBLIC_IP>/api/docs`.

Inspect startup failures with:

```bash
docker compose logs --tail=200 postgres
docker compose logs --tail=200 backend
docker compose logs --tail=200 frontend
docker compose logs --tail=200 caddy
```

## Verify network isolation

Run `docker compose ps`. Only Caddy should show host mappings for ports 80 and
443. PostgreSQL, backend, and frontend must not show published host ports.

Also inspect the rendered model:

```bash
docker compose config | grep -E 'published: "?(80|443|3000|3001|5432)"?'
```

Only 80 and 443 should be present. From another machine, check the VPS itself:

```bash
nmap -Pn -p 80,443,3000,3001,5432 <VPS_PUBLIC_IP>
```

Ports 3000, 3001, and 5432 must be reported as closed or filtered. Port 80
should be open. Port 443 can remain closed until a domain enables HTTPS.

## Add a domain and automatic HTTPS

1. Create a DNS A record for the domain pointing to the VPS public IPv4
   address. Create an AAAA record only when the VPS has working public IPv6.
2. Wait until public DNS lookups return the VPS address.
3. Keep inbound TCP ports 80 and 443 open. Caddy needs them for certificate
   issuance and HTTPS traffic.
4. Change these `.env` values, substituting the real domain:

```env
CADDY_SITE_ADDRESS=kanban.example.com
FRONTEND_URL=https://kanban.example.com
CORS_ORIGINS=https://kanban.example.com,app://-
GITLAB_REDIRECT_URI=https://kanban.example.com/api/v1/auth/gitlab/callback
NEXT_PUBLIC_API_URL=/api/v1
```

The GitLab callback is required only when GitLab login is enabled. Its exact
HTTPS URL must also be registered in the GitLab OAuth application.

Rebuild and recreate the application services so build-time frontend values
and backend origins are current:

```bash
docker compose config --quiet
docker compose up -d --build --force-recreate backend frontend caddy
docker compose logs --tail=200 caddy
```

Caddy obtains and renews the public certificate automatically. Verify
`https://kanban.example.com`, `/api/v1`, and `/api/docs`. If issuance fails,
check the A/AAAA records, inbound ports 80/443, and Caddy logs. Do not expose
backend or database ports as a workaround.

## Update the deployment

Fetch and review application changes, rebuild images, and recreate services:

```bash
git pull --ff-only
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=200 caddy backend frontend
```

Confirm the application works before pruning old images. Never use
`docker compose down --volumes` during a routine update because it deletes
persistent volumes.

## Backups

Create a PostgreSQL dump into a restricted backup directory:

```bash
mkdir -p backups
chmod 700 backups
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "backups/postgres-$(date +%F-%H%M%S).sql"
```

Back up the named `postgres_data` volume as part of the VPS backup policy as
well. The database dump is the portable recovery artifact; test restoring it
on a separate instance.

Caddy certificates and account state live in `caddy_data`. Its exact Docker
volume name includes the Compose project prefix and can be found with:

```bash
docker volume ls | grep caddy_data
```

Include that volume in machine snapshots or volume-level backups. The
`caddy_config` volume may also be included. Caddy can request certificates
again, but preserving its data avoids unnecessary certificate reissuance.

Store backups outside the VPS as well as locally. Deleting Docker volumes is
irreversible unless a separate backup exists.
