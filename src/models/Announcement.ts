import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
    title?: string;
    message: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

const AnnouncementSchema: Schema = new Schema(
    {
        title: { type: String },
        message: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// TTL Index removed to persist history
// AnnouncementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const AnnouncementModel: Model<IAnnouncement> =
    mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
