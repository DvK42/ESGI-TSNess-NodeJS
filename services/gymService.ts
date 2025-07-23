import {isValidObjectId, Model, Mongoose} from "mongoose";
import {Gym} from "../models";
import {gymSchema} from "../mongoose";
import {Difficulty} from "../utils/enums/difficulty";

export class GymService {
    readonly model: Model<Gym>;

    constructor(public readonly connection: Mongoose) {
        this.model = connection.model('Gym', gymSchema);
    }

    async findGymById(gymId: string): Promise<Gym | null> {
        if (!isValidObjectId(gymId)) {
            return null;
        }

        return this.model.findById(gymId)
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async findGymByName(name: string): Promise<Gym | null> {
        return this.model.findOne({name})
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async findGymsByDifficulty(difficulty: Difficulty): Promise<Gym[]> {
        return this.model.find({difficulty})
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async findGymsByManager(managerId: string): Promise<Gym[]> {
        if (!isValidObjectId(managerId)) {
            return [];
        }

        return this.model.find({manager: managerId})
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async findApprovedGyms(): Promise<Gym[]> {
        return this.model.find({isApproved: true})
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async findPendingGyms(): Promise<Gym[]> {
        return this.model.find({isApproved: false})
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async createGym(gym: Gym): Promise<Gym> {
        return this.model.create(gym);
    }

    async updateGym(gymId: string, updates: Partial<Gym>): Promise<Gym | null> {
        if (!isValidObjectId(gymId)) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            gymId,
            updates,
            {new: true}
        )
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async deleteGym(gymId: string): Promise<boolean> {
        if (!isValidObjectId(gymId)) {
            return false;
        }

        const result = await this.model.deleteOne({_id: gymId});
        return result.deletedCount > 0;
    }

    async getAllGyms(): Promise<Gym[]> {
        return this.model.find()
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async approveGym(gymId: string): Promise<Gym | null> {
        if (!isValidObjectId(gymId)) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            gymId,
            {isApproved: true, isDeclined: false},
            {new: true}
        )
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }

    async rejectGym(gymId: string): Promise<Gym | null> {
        if (!isValidObjectId(gymId)) {
            return null;
        }

        return this.model.findByIdAndUpdate(
            gymId,
            {isDeclined: true, isApproved: false},
            {new: true}
        )
            .populate('manager')
            .populate('exerciseTypes')
            .exec();
    }
}
