import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for a single module
export interface IModule extends Document {
  moduleId: string;
  title: string;
  description: string;
  xpValue: number;
}

// Interface for a learning path
export interface ILearningPath extends Document {
  title: string;
  description: string;
  interest: string;
  modules: IModule[];
}

// Mongoose schema for a module
const ModuleSchema: Schema<IModule> = new Schema({
  moduleId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  xpValue: { type: Number, required: true, default: 20 },
});

// Mongoose schema for a learning path
const LearningPathSchema: Schema<ILearningPath> = new Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  interest: { type: String, required: true, index: true },
  modules: [ModuleSchema],
});

// Check if the model is already compiled
const LearningPath: Model<ILearningPath> = mongoose.models.LearningPath || mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);

export default LearningPath; 