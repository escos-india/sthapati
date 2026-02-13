import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const connectionRequestSchema = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// Ensure a sender can only have one pending request to a recipient
connectionRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export type ConnectionRequestDocument = InferSchemaType<typeof connectionRequestSchema>;
export const ConnectionRequestModel: Model<ConnectionRequestDocument> =
    models.ConnectionRequest || model<ConnectionRequestDocument>('ConnectionRequest', connectionRequestSchema);
