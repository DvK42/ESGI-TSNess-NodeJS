import { Schema, Types } from "mongoose";
import { GymEquipment } from "../../models";

export const gymEquipmentSchema = new Schema<GymEquipment>(
    {
        gymId: { type: Types.ObjectId, ref: "Gym", required: true },
        equipmentId: { type: Types.ObjectId, ref: "Equipment", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
    },
    {
        timestamps: true,
        collection: "gym_equipments",
        versionKey: false,
    }
);

// To avoid duplicates
gymEquipmentSchema.index({ gymId: 1, equipmentId: 1 }, { unique: true }); 
