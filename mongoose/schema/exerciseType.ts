import { Schema } from "mongoose";
import { ExerciseType } from "../../models";


export const exerciseTypeSchema = new Schema<ExerciseType>(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
    },
    {
        timestamps: true,
        collection: "exerciseTypes",
        versionKey: false,
    }
);
