# Smart Contract Security Scanner

A full-stack scanner for Solidity smart contracts. Upload files or paste code via a minimal web UI, and get automated security findings. Uses Node.js, TypeScript, Postgres, Redis, and BullMQ for job queues.
## **Features**

- Upload Solidity files (`.sol`) or paste code directly.
- Asynchronous scanning using a worker queue.
- Stores scan results in Postgres.
- Polling UI for live scan status.
- Minimal Web UI built with Next.js and SWR.

## **Folder Structure**

scanner/
├─ api/        # API server
├─ worker/     # Background scan worker
├─ web/        # Next.js frontend
├─ docker-compose.yml
├─ .env.example
└─ README.md


## **1. Clone the repo**

```bash
git clone https://github.com/gitslem/Smart-contract-Scanner.git
cd Smart-contract-Scanner


2. Setup environment variables

Copy the example .env file:

cp .env.example .env

Edit .env as needed (database URL, Redis URL).

3. Start Postgres & Redis

If using Docker:

docker-compose up -d

	•	Postgres: localhost:5432
	•	Redis: localhost:6379


4. Install dependencies

Install npm packages for each folder:

# API
cd api
npm install

# Worker
cd ../worker
npm install

# Web UI
cd ../web
npm install

5. Run the services

Run each service in separate terminals:

# API
cd api
npm run dev  # http://localhost:3001

# Worker
cd ../worker
npm run dev  # listens for scan jobs

# Web UI
cd ../web
npm run dev  # http://localhost:3000



6. Use the scanner
	1.	Open: http://localhost:3000
	2.	Upload a Solidity file or paste code.
	3.	Click Scan.
	4.	Click the link to view scan results (/scan/[scanId]).


7. Optional: Start everything at once

Create start.sh in the repo root:

#!/bin/bash
docker-compose up -d
(cd api && npm run dev) &
(cd worker && npm run dev) &
(cd web && npm run dev) &
wait

Run:

chmod +x start.sh
./start.sh



8. Notes
	•	Use .env only locally. Do not commit secrets.
	•	Scan results are stored in Postgres (scans and findings tables).
	•	Worker uses BullMQ and Redis for asynchronous job processing.


9. Contributing
	•	Fork the repo, make changes, and submit a pull request.
	•	Please follow TypeScript best practices and keep the code modular.

10. License

This README will make it **easy for anyone to clone and use your scanner** directly from GitHub.  

I can also create a **ready `.env.example` file and Docker Compose** snippet you can push with this README so the setup is completely plug-and-play.  

Do you want me to do that next?
