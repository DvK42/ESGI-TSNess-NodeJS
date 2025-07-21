import {isValidObjectId, Model, Mongoose} from "mongoose";
import {Exercise} from "../models";
import {exerciseSchema} from "../mongoose";

export class ExerciseService {
    readonly model: Model<Exercise>;

    constructor(public readonly connection: Mongoose) {
        this.model = connection.model('Exercise', exerciseSchema);
    }

    async findExerciseById(exerciseId: string): Promise<Exercise | null> {
        if (!isValidObjectId(exerciseId)) {
            return null;
        }

        return this.model.findById(exerciseId)
            .populate('equipment')
            .exec();
    }

    async findExercisesByDifficulty(difficulty: string): Promise<Exercise[]> {
        return this.model.find({difficulty})
            .populate('equipment')
            .exec();
    }

    async findExercisesByEquipment(equipmentId: string): Promise<Exercise[]> {
        if (!isValidObjectId(equipmentId)) {
            return [];
        }

        return this.model.find({equipment: equipmentId})
            .populate('equipment')
            .exec();
    }

    async createExercise(exercise: Exercise): Promise<Exercise> {
        return this.model.create(exercise);
    }

    async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<Exercise | null> {
        if (!isValidObjectId(exerciseId)) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            exerciseId,
            updates,
            {new: true}
        )
            .populate('equipment')
            .exec();
    }

    async deleteExercise(exerciseId: string): Promise<boolean> {
        if (!isValidObjectId(exerciseId)) {
            return false;
        }

        const result = await this.model.deleteOne({_id: exerciseId});
        return result.deletedCount > 0;
    }

    async getAllExercises(): Promise<Exercise[]> {
        return this.model.find()
            .populate('equipment')
            .exec();
    }
}
