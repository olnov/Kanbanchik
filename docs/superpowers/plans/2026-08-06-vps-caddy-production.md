# VPS Caddy Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Caddy the only public entry point for the production Docker Compose stack and document initial IP-based deployment plus the later switch to domain-backed HTTPS.

**Architecture:** PostgreSQL, the NestJS backend, and the Next.js frontend share the private `kanbanchik` bridge network without host port mappings. Caddy publishes ports 80 and 443, routes `/api/*` unchanged to `backend:3001`, routes all other traffic to `frontend:3000`, and persists its certificate state in named volumes.

**Tech Stack:** Docker Compose, Caddy 2, PostgreSQL 16, NestJS, Next.js

## Global Constraints

- Modify the root `docker-compose.yml`; do not modify or stage the user's untracked `docker-compose.dev.yml`.
- Caddy must be the only service with host port mappings.
- The initial deployment must serve plain HTTP by VPS IP with `CADDY_SITE_ADDRESS=:80`.
- Domain deployment must use Caddy automatic HTTPS without adding another proxy.
- Browser API requests must use the same-origin base path `/api/v1`.
- Demo database seeding must be disabled in the production environment example.
- Do not expose PostgreSQL port 5432 or application ports 3000 and 3001 on the host.

---

### Task 1: Private application network and Caddy entry point

**Files:**
- Create: `Caddyfile`
- Modify: `docker-compose.yml`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Docker service names `frontend`, `backend`, and `postgres`; backend route prefix `/api/`; environment variable `CADDY_SITE_ADDRESS`.
- Produces: public HTTP/HTTPS entry point on Caddy ports 80 and 443; internal upstreams `frontend:3000` and `backend:3001`; browser API base URL `/api/v1`.

- [ ] **Step 1: Render the current Compose model and demonstrate the unsafe host bindings**

Run:

```powershell
docker compose --env-file .env.example config | Select-String -Pattern 'published: "?(3000|3001|5432)"?'
```

Expected: published bindings for ports 3000, 3001, and 5432, proving the current topology does not satisfy the production requirement.

- [ ] **Step 2: Add the Caddy routing configuration**

Create `Caddyfile` with:

```caddyfile
{$CADDY_SITE_ADDRESS} {
	encode zstd gzip

	handle /api/* {
		reverse_proxy backend:3001
	}

	handle {
		reverse_proxy frontend:3000
	}
}
```

The `handle` directive preserves `/api/...` paths so the NestJS prefix remains intact.

- [ ] **Step 3: Convert the root Compose file to the private-service topology**

In `docker-compose.yml` remove `ports` from `postgres`, `backend`, and `frontend`; set backend `PORT: 3001`; and add `caddy:2-alpine`. Pass `CADDY_SITE_ADDRESS: ${CADDY_SITE_ADDRESS:-:80}`, publish `80:80`, `443:443`, and `443:443/udp`, mount the Caddyfile read-only, mount named volumes at `/data` and `/config`, depend on frontend/backend with `condition: service_started`, and attach Caddy to `kanbanchik`. Declare `caddy_data` and `caddy_config` alongside `postgres_data`.

- [ ] **Step 4: Make the environment example production-safe**

In `.env.example`, remove `POSTGRES_PORT`, `BACKEND_PORT`, and `FRONTEND_PORT`; set `AUTO_SEED_DEMO=false`; set `NEXT_PUBLIC_API_URL=/api/v1`; and add `CADDY_SITE_ADDRESS=:80`. Retain explicit change-before-deploy values for `POSTGRES_PASSWORD` and `JWT_SECRET`.

- [ ] **Step 5: Render and inspect the completed Compose model**

Run:

```powershell
docker compose --env-file .env.example config --quiet
docker compose --env-file .env.example config | Select-String -Pattern 'published: "?(3000|3001|5432)"?'
docker compose --env-file .env.example config | Select-String -Pattern 'published: "?(80|443)"?'
```

Expected: the first command exits 0; the second prints nothing; the third shows only Caddy's 80/443 mappings.

- [ ] **Step 6: Validate the Caddyfile in the official image**

Run:

```powershell
docker run --rm --env CADDY_SITE_ADDRESS=:80 --volume "${PWD}/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile
```

Expected: exit code 0 and output ending with `Valid configuration`.

- [ ] **Step 7: Review the topology diff**

Run:

```powershell
git diff --check
git diff -- Caddyfile docker-compose.yml .env.example
git status --short
```

Expected: no whitespace errors; no application code changes; `docker-compose.dev.yml` remains untracked and unchanged.

- [ ] **Step 8: Commit the production topology**

```powershell
git add -- Caddyfile docker-compose.yml .env.example
git commit -m "feat: secure production compose behind Caddy"
```

### Task 2: VPS and domain deployment documentation

**Files:**
- Create: `docs/deployment-vps.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `CADDY_SITE_ADDRESS`, `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, `GITLAB_REDIRECT_URI`, and the root Docker Compose commands established in Task 1.
- Produces: an operator runbook for IP-based HTTP deployment, firewall verification, updates, backups, DNS setup, and automatic HTTPS activation.

- [ ] **Step 1: Capture the documentation gaps before editing**

Run:

```powershell
rg -n "Caddy|CADDY_SITE_ADDRESS|automatic HTTPS|docker compose config|5432" README.md docs
```

Expected: no operator runbook exists and the README still describes direct frontend, backend, and PostgreSQL host ports.

- [ ] **Step 2: Write the VPS deployment runbook**

Create `docs/deployment-vps.md` with concrete sections covering:

1. Linux VPS prerequisites, Docker Engine with Compose, public TCP 22/80/443 and UDP 443, and no public rules for 3000/3001/5432.
2. Initial setup: clone, copy `.env.example` to `.env`, replace database/JWT secrets, use `CADDY_SITE_ADDRESS=:80`, `/api/v1`, and IP-based `FRONTEND_URL`/`CORS_ORIGINS`.
3. Validation and launch using `docker compose config --quiet`, `docker compose up -d --build`, `docker compose ps`, and service logs.
4. Security verification using Compose output and external `nmap -Pn -p 80,443,3000,3001,5432 VPS_IP`, with 3000/3001/5432 expected closed or filtered.
5. Domain migration: DNS A/AAAA, `CADDY_SITE_ADDRESS=kanban.example.com`, HTTPS public URLs/CORS/GitLab callback, container recreation, and certificate-log checks.
6. Safe update commands and checking logs before image cleanup.
7. PostgreSQL and Caddy volume backups, warning that volume deletion removes persistent state.

- [ ] **Step 3: Update README deployment guidance**

State that the root compose is production-oriented; users open `http://localhost` or the VPS IP through Caddy; API and Swagger use the same origin; PostgreSQL has no root-compose host port; detailed VPS/domain instructions are in `docs/deployment-vps.md`; and `docker-compose.infra.yml` is local-development-only.

- [ ] **Step 4: Check documentation consistency**

Run:

```powershell
rg -n "localhost:3000|localhost:3001|localhost:5432|POSTGRES_PORT|BACKEND_PORT|FRONTEND_PORT" README.md docs/deployment-vps.md .env.example docker-compose.yml
git diff --check
```

Expected: remaining direct localhost application URLs are labeled for non-Docker development; removed host-port variables do not appear in production files; no whitespace errors.

- [ ] **Step 5: Commit the operator documentation**

Because `docs/` is ignored, force-add only the new runbook:

```powershell
git add -- README.md
git add -f -- docs/deployment-vps.md
git commit -m "docs: add VPS and domain deployment guide"
```

### Task 3: End-to-end configuration verification

**Files:**
- Verify: `Caddyfile`
- Verify: `docker-compose.yml`
- Verify: `.env.example`
- Verify: `README.md`
- Verify: `docs/deployment-vps.md`

**Interfaces:**
- Consumes: all artifacts from Tasks 1 and 2.
- Produces: fresh evidence that the effective production configuration meets every approved requirement.

- [ ] **Step 1: Re-render the full production configuration**

Run:

```powershell
docker compose --env-file .env.example config --quiet
docker compose --env-file .env.example config
```

Expected: both commands exit 0; only Caddy contains published host ports.

- [ ] **Step 2: Revalidate Caddy routing**

Run:

```powershell
docker run --rm --env CADDY_SITE_ADDRESS=:80 --volume "${PWD}/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile
```

Expected: exit code 0 and `Valid configuration`.

- [ ] **Step 3: Verify approved requirements against the diff**

Run:

```powershell
git diff HEAD~2..HEAD --check
git show --stat --oneline HEAD~2..HEAD
git status --short
```

Check explicitly that PostgreSQL/backend/frontend have no `ports`, Caddy owns 80/443, `/api/*` is preserved, `/api/v1` is the frontend build value, demo seeding is off in the example, and the domain migration procedure is documented. Expected: all checks pass and the only unrelated working-tree entry remains the pre-existing untracked `docker-compose.dev.yml`.
