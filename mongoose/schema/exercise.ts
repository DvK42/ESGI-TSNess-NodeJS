import {Schema} from "mongoose";
import {Exercise} from "../../models";
import {Difficulty} from "../../utils/enums/difficulty";

export const exerciseSchema = new Schema<Exercise>({
        name: {type: String, required: true},
        description: {type: String, required: true},
        difficulty: {type: String, required: true, enum: Object.values(Difficulty)},
        equipment: {type: Schema.Types.ObjectId, ref: "Equipment", required: true},
    },
    {
        timestamps: true,
        collection: "exercises",
        versionKey: false,
    }
);
