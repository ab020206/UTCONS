import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  date: Date;
}

const AnnouncementSchema: Schema<IAnnouncement> = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement; 