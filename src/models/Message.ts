import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const messageSchema = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, sender: 1 });

export type MessageDocument = InferSchemaType<typeof messageSchema>;
export const MessageModel: Model<MessageDocument> =
    models.Message || model<MessageDocument>('Message', messageSchema);
