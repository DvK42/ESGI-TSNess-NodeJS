import { Schema, Types } from "mongoose";
import { Equipment, Muscle } from "../../models";

export const equipmentSchema = new Schema<Equipment>(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        targetedMuscles: { type: [String], required: true, enum: Object.values(Muscle) },
        exerciseTypes: { type: [Types.ObjectId], ref: "ExerciseType", required: true, default: [] },
    },
    {
        timestamps: true,
        collection: "equipments",
        versionKey: false,
    }
);
