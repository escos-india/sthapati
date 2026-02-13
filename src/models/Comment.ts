import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    author: {
        _id: mongoose.Types.ObjectId;
        name: string;
        image: string;
        headline?: string;
    };
    content: string;
    parentComment?: mongoose.Types.ObjectId; // For nested replies
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
    }
);

// Virtual populate for replies if needed, or just query separately
CommentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
});

// Ensure virtuals are included in JSON
CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

export const CommentModel: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
