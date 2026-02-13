import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    title: string;
    content: string;
    image?: string;
    video?: string;
    tags?: string[];
    likes: mongoose.Types.ObjectId[]; // Changed from number to array
    comments: number;
    shares: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

const PostSchema: Schema = new Schema(
    {
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        // title: { type: String, required: true }, // Wait, title isn't used in feed creation? 
        // Existing schema had title required, but DashboardFeed only sends content. 
        // I should probably make title optional or default.
        // Actually, let's look at DashboardFeed creation. It only sends content. 
        // So 'title' required will break post creation too if I don't fix it.
        // Let's remove 'required' from title or make it optional.
        title: { type: String },
        content: { type: String, required: true },
        image: { type: String },
        video: { type: String },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of users
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        tags: [{ type: String }],
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

export const PostModel: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
