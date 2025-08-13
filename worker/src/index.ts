import { Worker } from "bullmq";
import dotenv from "dotenv";

dotenv.config({ path: `${process.env.HOME}/.scanner/.env` });

const connection = { url: process.env.REDIS_URL || "redis://localhost:6379" };

const worker = new Worker("scan-queue", async job => {
  console.log(`Processing job ${job.id} with data:`, job.data);
  // Do work here...
}, { connection });

console.log("Worker started, waiting for jobs...");
