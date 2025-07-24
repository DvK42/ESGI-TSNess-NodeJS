import { Difficulty } from "../utils/enums/difficulty";
import { Equipment } from "./equipment";
import { Timestamps } from "./timestamps";

export interface Exercise extends Timestamps {
    _id: string;
    name: string;
    description: string;
    difficulty: Difficulty;
    equipment: Equipment;
}
