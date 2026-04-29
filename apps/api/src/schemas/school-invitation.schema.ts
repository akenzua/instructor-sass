import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SchoolInvitationDocument = SchoolInvitation & Document;

export const InvitationStatuses = [
  "pending",
  "accepted",
  "declined",
  "expired",
] as const;

@Schema({ timestamps: true })
export class SchoolInvitation {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "School", required: true, index: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ enum: ["admin", "instructor"], default: "instructor" })
  role: string;

  @Prop({ enum: InvitationStatuses, default: "pending" })
  status: string;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const SchoolInvitationSchema =
  SchemaFactory.createForClass(SchoolInvitation);

SchoolInvitationSchema.index({ schoolId: 1, email: 1 });
SchoolInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SchoolInvitationSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
