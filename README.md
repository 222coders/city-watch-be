# city-watch-be

Backend API for City Watch, built with FastAPI, SQLModel, and Postgres.

## Prerequisites

- Python 3.12+ (see `.python-version`)
- Neon project configured with Postgres & Object Storage (or optional Docker for local Postgres)

## Local setup

**1. Create your env file**

```bash
cp .env.example .env
```

Fill in `GEMINI_API_KEY`, `GEOAPIFY_API_KEY`, and your Neon credentials (`DATABASE_URL`, `AWS_*` storage keys).

**2. Install dependencies & git hooks**

```bash
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && pre-commit install
```

**3. Database setup**

You can connect to **Neon Cloud** or run a **Local Docker container**:

* **Option A: Neon Cloud (Recommended)**
  Link your branch with `neon link` or set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in `.env`. No Docker required.

* **Option B: Local Docker Postgres**
  Start the local database container:
  ```bash
  docker compose up -d
  ```
  And set your `.env` to:
  ```ini
  DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/citywatch
  ```

**4. Apply migrations and seed data**

`alembic upgrade head` is idempotent — a database already at head does nothing. The app does not create tables itself, so this must run before the first boot.

```bash
alembic upgrade head
python -m db.seed
```

Pass `--force` to `db.seed` to wipe existing markers and addresses before reloading fixtures.

## Running the server

```bash
uvicorn main:app --reload --port 8000
```

The API is then at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs` and a health check at `http://localhost:8000/health`.

`python main.py` also works, but runs without auto-reload.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` `POST` `PUT` | `/marker`, `/marker/{id}` | Incident markers |
| `GET` `POST` `PUT` `DELETE` | `/address`, `/address/{id}` | Addresses attached to markers |
| `POST` | `/submit-report-gemini` | Text report parsed by Gemini |
| `POST` | `/submit-report-gemini-multimodal` | Image report parsed by Gemini |

## Database migrations

After changing a model in `db/models.py`:

```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## Linting

Ruff is enforced in CI, and pre-commit runs it on staged files.

```bash
pre-commit install
ruff check . && ruff format --check .
```

Use `ruff check --fix .` and `ruff format .` to apply fixes.

## Environment variables

See `.env.example`:

- `GEMINI_API_KEY` — API key for Gemini.
- `GEOAPIFY_API_KEY` — API key for Geoapify geocoding.
- `DEFAULT_LOCATION` — Default city/region context for Gemini prompt resolution (optional, defaults to `Toronto, Ontario, Canada`).
- `DATABASE_URL` — PostgreSQL connection string (Neon pooled connection or local Docker).
- `DATABASE_URL_UNPOOLED` — Direct PostgreSQL connection string for Alembic migrations on Neon.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — Optional Docker database credentials for local container.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`, `AWS_ENDPOINT_URL_S3` — S3-compatible storage config for Neon Object Storage.
- `REDIS_URL` — Rate-limit storage. Optional; without it slowapi keeps counters in process memory.
