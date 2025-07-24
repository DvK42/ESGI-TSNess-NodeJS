import {ChallengeGroupTry} from "./challengeGroupTry";
import {Timestamps} from "./timestamps";

export enum UserRole {
    ADMIN = "ADMIN",
    DIRECTOR = "DIRECTOR",
    USER = "USER",
}

export const getUserRoleLevel = (role: UserRole): number => {
    switch (role) {
        case UserRole.ADMIN:
            return 4;
        case UserRole.DIRECTOR:
            return 2;
        case UserRole.USER:
            return 1;
        default:
            return 0;
    }
};

export interface User extends Timestamps {
    _id: string;
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    groups?: ChallengeGroupTry[];
    score: number;
}
