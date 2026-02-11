import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MagicLinkTokenDocument = MagicLinkToken & Document;

@Schema({ timestamps: true })
export class MagicLinkToken {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: "Lesson" })
  bookingId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const MagicLinkTokenSchema = SchemaFactory.createForClass(MagicLinkToken);

// TTL index to automatically delete expired tokens after 1 hour
MagicLinkTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

MagicLinkTokenSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
