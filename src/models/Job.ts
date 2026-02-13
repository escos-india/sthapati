import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const jobSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, required: true },
        type: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
            required: true
        },
        salary_range: { type: String },
        requirements: [{ type: String }],
        posted_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['active', 'closed', 'draft'],
            default: 'active'
        }
    },
    { timestamps: true }
);

export type JobDocument = InferSchemaType<typeof jobSchema>;

export const JobModel: Model<JobDocument> =
    (models.Job as Model<JobDocument>) || model<JobDocument>('Job', jobSchema);
