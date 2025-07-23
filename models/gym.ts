import {ExerciseType} from "./exerciseType";
import {Timestamps} from "./timestamps";
import {User} from "./user";
import {Difficulty} from "../utils/enums/difficulty";

export interface Gym extends Timestamps {
    _id: string;
    name: string;
    capacity: number;
    address: string;
    contact: string;
    difficulty: Difficulty;
    manager: string | User;
    exerciseTypes: string[] | ExerciseType[];
    descriptionEquipments: string;
    descriptionExerciseTypes: string;
    isApproved: boolean;
    isDeclined: boolean;
}
