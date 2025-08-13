import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Queue } from "bullmq";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: process.env.ENV_PATH || `${process.env.HOME}/.scanner/.env` });

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const scanQueue = new Queue("scan-queue", {
  connection: { url: process.env.REDIS_URL || "redis://localhost:6379" },
});

app.post("/scans", async (req, res) => {
  try {
    const { userId, sourceOrigin, srcDir } = req.body;
    const scanId = uuidv4();

    await pool.query(
      "INSERT INTO scans (id, user_id, status, source_origin, created_at) VALUES ($1,$2,$3,$4, now())",
      [scanId, userId, "queued", sourceOrigin]
    );

    await scanQueue.add("run-scan", { scanId, srcDir });
    res.json({ scanId, status: "queued" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "internal_error", details: String(err.message || err) });
  }
});

app.get("/scans/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM scans WHERE id=$1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });

    const findings = await pool.query(
      "SELECT * FROM findings WHERE scan_id=$1 ORDER BY created_at DESC",
      [req.params.id]
    );

    res.json({ scan: rows[0], findings: findings.rows });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "internal_error", details: String(err.message || err) });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
