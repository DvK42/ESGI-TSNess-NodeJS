import { Mongoose, Model, isValidObjectId } from "mongoose";
import { GymEquipment } from "../models";
import { gymEquipmentSchema } from "../mongoose";

export class GymEquipmentService {
    readonly model: Model<GymEquipment>;

    constructor(public readonly connection: Mongoose) {
        this.model = connection.model('GymEquipment', gymEquipmentSchema);
    }

    async findGymEquipmentById(id: string): Promise<GymEquipment | null> {
        if (!isValidObjectId(id)) {
            return null;
        }

        return this.model.findById(id)
            .populate('gymId')
            .populate('equipmentId')
            .exec();
    }

    async addEquipmentToGym(gymId: string, equipmentId: string, quantity: number = 1): Promise<GymEquipment> {
        if (!isValidObjectId(gymId) || !isValidObjectId(equipmentId)) {
            throw new Error('Invalid gymId or equipmentId');
        }

        const existingRelation = await this.model.findOne({ gymId, equipmentId });

        if (existingRelation) {
            // Mettre à jour la quantité si la relation existe déjà
            existingRelation.quantity += quantity;
            return await existingRelation.save();
        }

        // Créer une nouvelle relation
        const gymEquipment = new this.model({
            gymId,
            equipmentId,
            quantity
        });

        return await gymEquipment.save();
    }

    async getGymEquipments(gymId: string): Promise<GymEquipment[]> {
        if (!isValidObjectId(gymId)) {
            return [];
        }

        return this.model.find({ gymId })
            .populate('gymId')
            .populate('equipmentId')
            .exec();
    }

    async getGymsWithEquipment(equipmentId: string): Promise<GymEquipment[]> {
        if (!isValidObjectId(equipmentId)) {
            return [];
        }

        return this.model.find({ equipmentId })
            .populate('gymId')
            .populate('equipmentId')
            .exec();
    }

    async updateEquipmentQuantity(gymId: string, equipmentId: string, quantity: number): Promise<GymEquipment | null> {
        if (!isValidObjectId(gymId) || !isValidObjectId(equipmentId)) {
            return null;
        }

        return this.model.findOneAndUpdate(
            { gymId, equipmentId },
            { quantity },
            { new: true }
        )
        .populate('gymId')
        .populate('equipmentId')
        .exec();
    }

    async removeEquipmentFromGym(gymId: string, equipmentId: string): Promise<boolean> {
        if (!isValidObjectId(gymId) || !isValidObjectId(equipmentId)) {
            return false;
        }

        const result = await this.model.deleteOne({ gymId, equipmentId });
        return result.deletedCount > 0;
    }

    async removeAllEquipmentsFromGym(gymId: string): Promise<boolean> {
        if (!isValidObjectId(gymId)) {
            return false;
        }

        const result = await this.model.deleteMany({ gymId });
        return result.deletedCount > 0;
    }

    async getAllGymEquipments(): Promise<GymEquipment[]> {
        return this.model.find()
            .populate('gymId')
            .populate('equipmentId')
            .exec();
    }

    async getEquipmentsByGymId(gymId: string): Promise<GymEquipment[]> {
        if (!isValidObjectId(gymId)) {
            return [];
        }

        return this.model.find({ gymId })
            .populate('equipmentId')
            .exec();
    }

    async getGymsByEquipmentId(equipmentId: string): Promise<GymEquipment[]> {
        if (!isValidObjectId(equipmentId)) {
            return [];
        }

        return this.model.find({ equipmentId })
            .populate('gymId')
            .exec();
    }
}
