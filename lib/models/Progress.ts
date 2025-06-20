import mongoose from 'mongoose'

interface HistoryEntry {
  date: Date
  xp: number
}

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  completedModules: [{ type: String }],
  history: [{
    date: { type: Date, required: true },
    xp: { type: Number, required: true }
  }]
}, { timestamps: true })

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema)
export default Progress
