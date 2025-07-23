import {Schema, Types} from "mongoose";
import {Gym} from "../../models";
import {Difficulty} from "../../utils/enums/difficulty";


export const gymSchema = new Schema<Gym>(
    {
        name: {type: String, required: true, unique: true},
        capacity: {type: Number, required: true, min: 1},
        address: {type: String, required: true},
        contact: {type: String, required: true},
        difficulty: {
            type: String,
            enum: Object.values(Difficulty),
            default: Difficulty.EASY,
            required: true,
        },
        manager: {type: Schema.Types.ObjectId, ref: "User", required: true},
        exerciseTypes: [{type: Types.ObjectId, ref: "ExerciseType", required: true}],

        descriptionEquipments: {type: String, required: true},
        descriptionExerciseTypes: {type: String, required: true},
        isApproved: {type: Boolean, default: false},
        isDeclined: {type: Boolean, default: false},
    },
    {
        timestamps: true,
        collection: "gyms",
        versionKey: false,
    }
);
