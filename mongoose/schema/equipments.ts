import { Schema, model, Types } from "mongoose";

export interface IEquipment {
  _id?: Types.ObjectId;
  gymId: Types.ObjectId;
  equipmentName: string;
  quantity: number;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    equipmentName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const equipmentModel = model<IEquipment>("equipments", EquipmentSchema);
