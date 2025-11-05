import express from 'express';
import Job from '../models/job.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

export default router;
