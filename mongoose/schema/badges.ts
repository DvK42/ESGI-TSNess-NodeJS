import { Schema, model, Document } from "mongoose";

export interface IBadge extends Document {
  name: string;
  description: string;
  ruleJson: Record<string, any>; // Règle d’attribution dynamique
  iconUrl?: string;
  createdAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ruleJson: { type: Schema.Types.Mixed, required: true },
  iconUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const badgeModel = model<IBadge>("badges", BadgeSchema);
