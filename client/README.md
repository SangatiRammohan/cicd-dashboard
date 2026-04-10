# CI/CD Platform Dashboard

A production-grade, full-stack GitOps CI/CD monitoring platform built with the MERN stack, Kubernetes, ArgoCD, Prometheus, and Grafana. Every `git push` triggers a fully automated pipeline — from Docker build to live Kubernetes deployment — with real-time monitoring visible in a live React dashboard.

## Screenshots

### Live Dashboard
![CI/CD Platform Dashboard](./public/gitimage.png)

![CI/CD Platform Dashboard](./public/gitimage1.png)


[![CI/CD Pipeline](https://github.com/SangatiRammohan/cicd-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/SangatiRammohan/cicd-dashboard/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black)](https://cicd-dashboard-kappa.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-purple)](https://cicd-dashboard-api-7voh.onrender.com/health)

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend Dashboard | https://cicd-dashboard-kappa.vercel.app |
| Backend API | https://cicd-dashboard-api-7voh.onrender.com/health |

> Note: The backend is hosted on Render free tier and may take ~30 seconds to wake up on first request.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Developer                                 │
│                      git push main                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CI Pipeline (GitHub Actions)                    │
│                                                                  │
│  1. Checkout code                                                │
│  2. Configure AWS credentials                                    │
│  3. Login to Amazon ECR                                          │
│  4. docker build → docker push (tagged with commit SHA)          │
│  5. Update k8s/deployment.yaml with new image tag               │
│  6. Commit and push manifest back to GitHub                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ triggers webhook
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CD Pipeline (ArgoCD GitOps)                     │
│                                                                  │
│  Polls GitHub every 3 minutes for manifest changes              │
│  Detects new image tag → Rolling update on k3d cluster          │
│  maxUnavailable: 0 → zero downtime deployment                   │
│  Health checks must pass before old pods terminate              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐    ┌────────────────────────┐
│   MongoDB Atlas     │    │     Observability       │
│                     │    │                         │
│  Pipeline run data  │    │  Prometheus scrapes     │
│  Deployment history │    │  /metrics every 15s     │
│  Webhook events     │    │                         │
└─────────────────────┘    │  Grafana dashboards:    │
                           │  - HTTP request rate    │
                           │  - p99 latency          │
                           │  - Heap memory          │
                           │  - CPU usage            │
                           └────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              React Dashboard (Vercel)                            │
│                                                                  │
│  Real-time updates via Socket.io WebSocket                      │
│  ┌──────────┬──────────┬──────────┬──────────┬────────────┐    │
│  │Total runs│ Success  │  Failed  │Fail rate │Avg duration│    │
│  └──────────┴──────────┴──────────┴──────────┴────────────┘    │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │   Pipeline runs     │  │         Live pods               │  │
│  │  (live updates)     │  │    (k8s readiness status)       │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Deployment history                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite | Dashboard UI |
| UI Library | Material UI, custom CSS | Styling |
| Real-time | Socket.io-client | Live WebSocket updates |
| Backend | Node.js 20, Express 5 | REST API + WebSocket server |
| WebSocket | Socket.io | Push events to frontend |
| Database | MongoDB Atlas | Store pipeline/deployment data |
| ORM | Mongoose | MongoDB schema and queries |
| Logging | Winston | Structured JSON logging |
| Metrics | prom-client | Prometheus metrics endpoint |
| Container | Docker | Application containerisation |
| Registry | AWS ECR | Docker image storage |
| Orchestration | Kubernetes (k3d) | Container orchestration |
| GitOps | ArgoCD v3.3 | Automated deployment |
| CI/CD | GitHub Actions | Build and deploy pipeline |
| Monitoring | Prometheus | Metrics collection |
| Dashboards | Grafana | Metrics visualisation |
| Helm | kube-prometheus-stack | Monitoring stack deployment |
| Frontend Host | Vercel | Static site hosting |
| Backend Host | Render | Node.js hosting |
| Cloud | AWS (ECR, IAM, ap-south-1) | Image registry |

---

## Features

### CI/CD
- **Fully automated pipeline** — every `git push` to `main` triggers build, push, and deploy
- **GitOps pattern** — ArgoCD watches the GitHub repo as the single source of truth
- **Zero-downtime rolling updates** — `maxUnavailable: 0`, `maxSurge: 1`
- **Image tagged with commit SHA** — full traceability from code to running container
- **Auto ECR token refresh** — CronJob refreshes AWS credentials every 6 hours

### Kubernetes
- **Health probes** — startup, liveness, and readiness probes on every pod
- **Resource limits** — CPU and memory requests/limits defined
- **Security hardened** — non-root user, read-only root filesystem, all Linux capabilities dropped
- **2 replicas** — high availability with automatic rescheduling

### Monitoring
- **Prometheus metrics** at `/metrics` — HTTP request rate, p99 latency, heap memory, CPU
- **ServiceMonitor** — Prometheus automatically discovers and scrapes the app
- **Grafana dashboards** — pre-built Kubernetes dashboards plus custom app metrics

### Dashboard
- **Live connection status** — green/red dot showing WebSocket state
- **Real-time pipeline runs** — updates instantly when GitHub Actions fires
- **Live pod status** — shows ready/not-ready state with restart counts
- **Metrics bar** — total runs, success count, failure rate, average duration
- **Deployment history** — records of every ArgoCD deployment

---

## Project Structure

```
cicd-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD pipeline
├── client/                         # React frontend (deployed to Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── MetricsBar.jsx      # Stats: total runs, success, failed
│   │   │   ├── PipelineList.jsx    # Live pipeline run list
│   │   │   ├── PodGrid.jsx         # Kubernetes pod status grid
│   │   │   └── DeploymentTable.jsx # Deployment history table
│   │   └── App.jsx                 # Root component, Socket.io, fetch
│   ├── .env.example
│   └── vite.config.js
├── k8s/                            # Kubernetes manifests (ArgoCD syncs these)
│   ├── namespace.yaml              # cicd-platform namespace
│   ├── configmap.yaml              # App environment config
│   ├── deployment.yaml             # App deployment (updated by CI)
│   ├── service.yaml                # ClusterIP service
│   ├── servicemonitor.yaml         # Prometheus scrape config
│   └── ecr-cronjob.yaml            # ECR token auto-refresh
├── src/                            # Express backend (deployed to Render)
│   ├── app.js                      # Express factory, middleware, routes
│   ├── server.js                   # HTTP + Socket.io server
│   ├── routes/
│   │   ├── pipelines.js            # GET /api/pipelines, /stats
│   │   ├── deployments.js          # GET /api/deployments
│   │   └── kubernetes.js           # GET /api/kubernetes/pods
│   ├── models/
│   │   ├── PipelineRun.js          # Mongoose schema for pipeline runs
│   │   └── Deployment.js           # Mongoose schema for deployments
│   ├── middleware/
│   │   └── errorHandler.js         # Global error handler
│   ├── webhooks/
│   │   ├── github.js               # GitHub workflow_run webhook handler
│   │   └── argocd.js               # ArgoCD sync webhook handler
│   └── utils/
│       └── logger.js               # Winston structured logger
├── Dockerfile
├── .env.example
└── package.json
```

---

## CI/CD Pipeline Detail

### GitHub Actions Workflow

```
Trigger: push to main branch

Steps:
  1. Checkout code
  2. Configure AWS credentials (from GitHub Secrets)
  3. Login to Amazon ECR
  4. Build Docker image tagged with commit SHA
  5. Push image to ECR
  6. Update k8s/deployment.yaml image tag with sed
  7. git commit + push back to GitHub [skip ci]

Permissions: contents: write
```

### ArgoCD Application

```
Source:  github.com/SangatiRammohan/cicd-dashboard — k8s/ path
Target:  k3d cluster, cicd-platform namespace
Sync:    Automated — prune: true, selfHeal: true
Poll:    Every 3 minutes
```

### Kubernetes Deployment Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0

Probes:
  startup:   GET /health — 12 retries x 5s = 60s window
  liveness:  GET /health — every 10s, 3 failures = restart
  readiness: GET /ready  — every 5s, 2 failures = remove from load balancer
```

---

## API Reference

### Health and Metrics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check |
| GET | `/metrics` | Prometheus metrics |

### Pipelines

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pipelines` | List recent pipeline runs |
| GET | `/api/pipelines/stats` | Aggregate stats |

### Deployments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/deployments` | List recent deployments |

### Kubernetes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/kubernetes/pods` | Live pod status |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/github` | GitHub workflow_run events |
| POST | `/webhooks/argocd` | ArgoCD sync events |

---

## Prometheus Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by method, route, status |
| `http_request_duration_seconds` | Histogram | Request latency |
| `nodejs_heap_size_used_bytes` | Gauge | Heap memory used |
| `process_cpu_seconds_total` | Counter | CPU time consumed |
| `nodejs_eventloop_lag_seconds` | Gauge | Event loop lag |

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker Desktop
- kubectl
- k3d
- Helm
- AWS CLI

### Install and run

```bash
git clone https://github.com/SangatiRammohan/cicd-dashboard.git
cd cicd-dashboard

npm install
cd client && npm install && cd ..

cp .env.example .env
# Edit .env with your values

# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open `http://localhost:5173`

---

## Kubernetes Deployment

```bash
# Create cluster
k3d cluster create cicd-cluster --agents 2

# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ecr-cronjob.yaml

# Create secrets
kubectl create secret docker-registry ecr-secret \
  --docker-server=<ECR_URI> \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region ap-south-1) \
  --namespace=cicd-platform

kubectl create secret generic mongodb-secret \
  --from-literal=MONGODB_URI="<YOUR_URI>" \
  --namespace=cicd-platform

# Install monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

kubectl apply -f k8s/servicemonitor.yaml
```

### Access dashboards

```bash
# Grafana — http://localhost:3001 (admin / admin123)
kubectl port-forward svc/monitoring-grafana -n monitoring 3001:80

# ArgoCD — http://localhost:9090
kubectl port-forward svc/argocd-server -n argocd 9090:80

# Prometheus — http://localhost:9091
kubectl port-forward svc/monitoring-kube-prometheus-prometheus -n monitoring 9091:9090
```

---

## Production Deployment

### Backend — Render

1. Connect GitHub repo on render.com
2. Root Directory: *(empty)*
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Add all environment variables

### Frontend — Vercel

1. Import GitHub repo on vercel.com
2. Root Directory: `client`
3. Framework: Vite
4. Add: `VITE_BACKEND_URL` = your Render URL

### GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |

### GitHub Webhook

- URL: `https://<render-url>/webhooks/github`
- Content type: `application/json`
- Secret: value of `GITHUB_WEBHOOK_SECRET`
- Events: Workflow runs, Deployment statuses

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port |
| `NODE_ENV` | Yes | development or production |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `GITHUB_WEBHOOK_SECRET` | Yes | Webhook HMAC secret |
| `KUBE_NAMESPACE` | Yes | Kubernetes namespace |
| `LOG_LEVEL` | No | Winston log level |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes (prod) | Backend API base URL |

---

## Real Debugging Stories

Real production issues hit and resolved during development:

**1. ECR Token Expiry — ImagePullBackOff after 19 hours**
AWS ECR tokens expire every 12 hours. After 19 hours both pods entered `ImagePullBackOff` with `403 Forbidden` on image pull. Fixed by refreshing `ecr-secret` and adding a CronJob to auto-refresh every 6 hours.

**2. ArgoCD Path Mismatch**
ArgoCD was syncing from `k8s/base` instead of `k8s/`. Diagnosed with `kubectl get application` and fixed by patching the Application spec via a JSON file (PowerShell doesn't support inline JSON with escape characters).

**3. MongoDB URI DNS Failure**
Local router DNS blocked Atlas SRV record resolution. `nslookup` with `8.8.8.8` worked but system DNS failed. Fixed by switching to a direct connection string bypassing SRV lookup.

**4. GitHub Actions 403 on Manifest Push**
CI built and pushed the image successfully but failed to push the updated manifest back. Fixed by adding `permissions: contents: write` and using `GITHUB_TOKEN` in the git remote URL.

**5. Webhook 404 — Route Ordering Bug**
GitHub webhook returned 404 even though the route existed. The Express 404 catch-all in `app.js` was catching requests before webhook routes defined in `server.js`. Fixed by moving webhook routes into `app.js` before the 404 handler.

**6. Socket.io Headers Conflict**
After refactoring to pass `io` to `createApp`, the server crashed with `ERR_HTTP_HEADERS_SENT`. Fixed by using `io.attach(server)` instead of passing the server to the Socket.io constructor directly.

---

## Deployment Map

| Component | Platform | Trigger |
|-----------|----------|---------|
| React frontend | Vercel | Auto-deploy on git push |
| Express backend | Render | Auto-deploy on git push |
| k8s manifests | k3d cluster via ArgoCD | ArgoCD polls GitHub |
| Docker image | AWS ECR | GitHub Actions on push |

---

## Author

**Sangati Rammohan**

- GitHub: [@SangatiRammohan](https://github.com/SangatiRammohan)
- LinkedIn: [sangatirammohan](https://linkedin.com/in/sangatirammohan)

---

## License

MIT