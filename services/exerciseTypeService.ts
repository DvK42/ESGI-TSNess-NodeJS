import { Mongoose, Model, isValidObjectId } from "mongoose";
import { ExerciseType } from "../models";
import { exerciseTypeSchema } from "../mongoose";

export class ExerciseTypeService {
    readonly model: Model<ExerciseType>;

    constructor(public readonly connection: Mongoose) {
        this.model = connection.model('ExerciseType', exerciseTypeSchema);
    }

    async findExerciseTypeById(exerciseTypeId: string): Promise<ExerciseType | null> {
        if (!isValidObjectId(exerciseTypeId)) {
            return null;
        }

        return this.model.findById(exerciseTypeId);
    }

    async createExerciseType(exerciseType: ExerciseType): Promise<ExerciseType> {
        return this.model.create(exerciseType);
    }

    async updateExerciseType(exerciseTypeId: string, updates: Partial<ExerciseType>): Promise<ExerciseType | null> {
        if (!isValidObjectId(exerciseTypeId)) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            exerciseTypeId,
            updates,
            { new: true }
        );
    }

    async deleteExerciseType(exerciseTypeId: string): Promise<boolean> {
        if (!isValidObjectId(exerciseTypeId)) {
            return false;
        }

        const result = await this.model.deleteOne({ _id: exerciseTypeId });
        return result.deletedCount > 0;
    }

    async getAllExerciseTypes(): Promise<ExerciseType[]> {
        return this.model.find();
    }
}
