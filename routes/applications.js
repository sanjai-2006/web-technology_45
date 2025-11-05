import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Application from '../models/application.js';
import User from '../models/user.js';
import Job from '../models/job.js';

const router = express.Router();

// storage
const uploadsDir = path.join(process.cwd(),'backend','uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage });

// Middleware to verify token (simple)
import jwt from 'jsonwebtoken';
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(data.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Apply (authenticated)
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, fullName, email } = req.body;
    if (!req.file) return res.status(400).json({ message: 'PDF resume required' });
    const app = new Application({
      userId: req.user._id,
      jobId,
      fullName,
      email,
      resumeFilename: req.file.filename
    });
    await app.save();
    res.json({ message: 'Application submitted', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List applications for logged in user
router.get('/', auth, async (req, res) => {
  const apps = await Application.find({ userId: req.user._id }).populate('jobId');
  res.json(apps);
});

// View resume (public static served via /uploads) - but ensure user owns it (optional check)
// We'll return the uploads URL for convenience
router.get('/:id', auth, async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (app.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  res.json({ url: '/uploads/' + app.resumeFilename });
});

// Delete application (and file) - auth required
router.delete('/:id', auth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Not found' });
    if (app.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const filePath = path.join(uploadsDir, app.resumeFilename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await app.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
