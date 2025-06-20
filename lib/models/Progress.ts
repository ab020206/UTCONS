import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  completedModules: [{ type: String }],
}, { timestamps: true })

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema)
export default Progress
