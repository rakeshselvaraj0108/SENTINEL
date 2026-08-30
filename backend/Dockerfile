# SENTINEL agent fleet - Cloud Run image.
#
# Two things about this build are load-bearing and easy to get wrong:
#
# 1. Hunter is not a pure-Python agent. It shells out to the real `git` and
#    `npm audit --json` binaries to produce findings, so a slim Python image
#    alone would let the container start and then fail at the first scan.
#    Node and git are therefore runtime dependencies, not build-time ones.
#
# 2. Cloud Run injects $PORT and terminates the TLS in front of us. Binding
#    to a hardcoded 8000 is the single most common reason a working local
#    image never passes a Cloud Run health check.

FROM python:3.12-slim AS builder

# Build-only toolchain: several deps (chromadb's ONNX runtime, grpc for
# Pub/Sub) ship sdists that need a compiler. Kept in a discarded stage so
# none of it reaches the runtime image.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim AS runtime

# git + node are Hunter's actual scanning tools (see note 1 above).
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app
COPY app ./app
COPY pytest.ini ./

# Cloud Run runs containers as an arbitrary non-root UID in some configs and
# the agent writes clones/evidence under workdir, so ownership has to be set
# before dropping privileges rather than relying on root.
RUN useradd --create-home --uid 1001 sentinel \
    && mkdir -p /app/workdir \
    && chown -R sentinel:sentinel /app
USER sentinel

ENV PORT=8080
EXPOSE 8080

# Shell form so $PORT expands. Single worker: the agent fleet keeps in-process
# state (findings cache, dedup lock) that is not shared across workers, so
# scaling happens through Cloud Run instances, not gunicorn forks.
CMD exec uvicorn app.server:app --host 0.0.0.0 --port ${PORT}
