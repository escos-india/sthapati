import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    resume: string;
    coverLetter?: string;
    realProfileLink?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        applicant: { type: Schema.Types.ObjectId, ref: 'JobSeeker', required: true },
        resume: { type: String, required: true },
        coverLetter: { type: String },
        realProfileLink: { type: String },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// Prevent model recompilation error in development
if (process.env.NODE_ENV === 'development' && mongoose.models.Application) {
    delete mongoose.models.Application;
}

export const ApplicationModel = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
