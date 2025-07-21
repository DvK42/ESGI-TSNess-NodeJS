import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Equipment } from "../models";
import { equipmentSchema } from "../mongoose";

export class EquipmentService {
    readonly model: Model<Equipment>;

    constructor(public readonly connection: Mongoose) {
        this.model = connection.model('Equipment', equipmentSchema);
    }

    async findEquipmentById(equipmentId: string): Promise<Equipment | null> {
        if (!isValidObjectId(equipmentId)) {
            return null;
        }

        return this.model.findById(equipmentId);
    }

    async findEquipmentsByMuscle(muscle: string): Promise<Equipment[]> {
        return this.model.find({ targetedMuscles: muscle });
    }

    async createEquipment(equipment: Equipment): Promise<Equipment> {
        return await this.model.create(equipment);
    }

    async updateEquipment(equipmentId: string, updates: Partial<Equipment>): Promise<Equipment | null> {
        if (!isValidObjectId(equipmentId)) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            equipmentId,
            updates,
            { new: true }
        );
    }

    async deleteEquipment(equipmentId: string): Promise<boolean> {
        if (!isValidObjectId(equipmentId)) {
            return false;
        }

        const result = await this.model.deleteOne({ _id: equipmentId });
        return result.deletedCount > 0;
    }

    async getAllEquipments(): Promise<Equipment[]> {
        return this.model.find();
    }

    async getEquipmentsByExerciseType(exerciseTypeId: string): Promise<Equipment[]> {
        if (!isValidObjectId(exerciseTypeId)) {
            return [];
        }

        return this.model.find({ exercicesTypes: exerciseTypeId });
    }
}
