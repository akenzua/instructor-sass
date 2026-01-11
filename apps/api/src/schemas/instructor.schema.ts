import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InstructorDocument = Instructor & Document;

@Schema({ timestamps: true })
export class Instructor {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  businessName?: string;

  @Prop({ default: 45 })
  hourlyRate: number;

  @Prop({ default: "GBP" })
  currency: string;

  @Prop()
  stripeAccountId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);

// Indexes
InstructorSchema.index({ email: 1 });

// Virtual for full name
InstructorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
InstructorSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
