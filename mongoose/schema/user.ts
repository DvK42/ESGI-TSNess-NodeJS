import {Schema} from "mongoose";

import {User, UserRole} from "../../models";

export const userSchema: Schema<User> = new Schema(
    {
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
            required: true,
        },
        isActive: {type: Boolean, default: true},
        groups: [{type: Schema.Types.ObjectId, ref: "ChallengeGroupTry"}],
        score: {type: Number, default: 0},
    },
    {
        timestamps: true,
        collection: "users",
        versionKey: false,
    }
);
