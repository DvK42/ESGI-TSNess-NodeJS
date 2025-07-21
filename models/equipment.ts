import { ExerciseType } from "./exerciseType";

export enum Muscle {
    CHEST = 'CHEST',
    BACK = 'BACK',
    ARMS = 'ARMS',
    LEGS = 'LEGS',
    ABS = 'ABS',
    GLUTES = 'GLUTES',
    OTHER = 'OTHER'
}

export interface Equipment {
    _id: string;
    name: string;
    description: string;
    targetedMuscles: Muscle[];
    exerciseTypes: ExerciseType[];
}
