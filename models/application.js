import mongoose from 'mongoose';
const appSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  fullName: String,
  email: String,
  resumeFilename: String,
  appliedAt: { type: Date, default: Date.now }
});
export default mongoose.model('Application', appSchema);
