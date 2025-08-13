FROM python:3.11-slim

# Install any dependencies for Slither, Solhint, etc.
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY analyzer.py /app/

CMD ["python", "analyzer.py"]
