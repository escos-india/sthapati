import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const jobSeekerSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        phone: { type: String, unique: true },
        image: { type: String },

        // Specific Job Seeker Fields
        headline: { type: String, maxlength: 220 },
        bio: { type: String, maxlength: 2600 },

        resume: { type: String }, // URL to PDF

        skills: [{
            name: { type: String },
            proficiency: { type: String }, // Beginner, Intermediate, Expert
        }],

        experience: [{
            title: { type: String },
            organization: { type: String },
            type: { type: String },
            start_date: { type: Date },
            end_date: { type: Date },
            is_current: { type: Boolean, default: false },
            description: { type: String },
        }],

        education: [{
            institution: { type: String },
            degree: { type: String },
            field_of_study: { type: String },
            start_date: { type: Date },
            end_date: { type: Date },
            is_current: { type: Boolean, default: false },
        }],

        preferences: {
            work_type: { type: String, enum: ['Remote', 'Hybrid', 'Onsite', 'Any'], default: 'Onsite' },
            expected_salary: { type: String },
            locations: [{ type: String }], // Preferred cities
        },

        social_links: {
            website: { type: String },
            linkedin: { type: String },
            github: { type: String },
            portfolio: { type: String }
        },

        status: {
            type: String,
            enum: ['active', 'banned'],
            default: 'active'
        },

        // Subscription fields
        subscriptionStatus: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },
        subscriptionExpiry: { type: Date },
    },
    { timestamps: true }
);

export type JobSeekerDocument = InferSchemaType<typeof jobSeekerSchema>;

// Force model recompilation in dev
if (process.env.NODE_ENV === 'development' && models.JobSeeker) {
    delete models.JobSeeker;
}

export const JobSeekerModel: Model<JobSeekerDocument> =
    (models.JobSeeker as Model<JobSeekerDocument>) || model<JobSeekerDocument>('JobSeeker', jobSeekerSchema);
