import {isValidObjectId, Model, Mongoose} from "mongoose";

import {Challenge, Result, User, UserRole} from "../models";
import {challengeSchema, resultSchema} from "../mongoose";
import {TrainingService} from "./trainingService";
import {ChallengeTryService} from "./challengeTryService";

export type createChallenge = Omit<Challenge, '_id' | 'createdAt' | 'updatedAt' | 'creator'> & {
    results?: Array<Omit<Result, '_id' | 'createdAt' | 'updatedAt'>>;
};

export type UpdateChallenge = Partial<Omit<Challenge, '_id' | 'createdAt' | 'updatedAt' | 'creator'>> & {
    results?: Array<Omit<Result, '_id' | 'createdAt' | 'updatedAt'>>;
};

export class ChallengeService {
    readonly challengeModel: Model<Challenge>;
    readonly resultModel: Model<Result>;

    constructor(
        public readonly connection: Mongoose,
        public readonly trainingService: TrainingService,
        public readonly challengeTryService: ChallengeTryService,
    ) {
        this.challengeModel = connection.model('Challenge', challengeSchema);
        this.resultModel = connection.model('Result', resultSchema);
    }

    async createChallenge(user: User, challenge: createChallenge): Promise<Challenge> {
        let resultIds: string[] = [];
        if (challenge.targetResults && challenge.targetResults.length > 0) {
            const createdResults = await this.resultModel.insertMany(challenge.targetResults);
            resultIds = createdResults.map(result => result._id);
        }

        const challengeData = {
            ...challenge,
            creator: user._id,
            targetResults: resultIds
        };

        const createChallenge = await this.challengeModel.create(challengeData);
        const populatedChallenge = await this.findChallengeById(createChallenge._id);
        if (!populatedChallenge) {
            throw new Error("Challenge not found after creation");
        }

        return populatedChallenge;
    }

    async findChallengeById(challengeId: string): Promise<Challenge | null> {
        if (!isValidObjectId(challengeId)) {
            return null;
        }

        return await this.challengeModel.findById(challengeId)
            .populate({
                path: 'targetResults',
                populate: {path: 'exercise'}
            });
    }

    async findChallenges(limit?: number, offset?: number): Promise<Challenge[]> {
        const query = this.challengeModel.find()
            .populate({
                path: 'targetResults',
                populate: {path: 'exercise'}
            })
            .sort({createdAt: -1});

        if (limit) {
            query.limit(limit);
        }
        if (offset) {
            query.skip(offset);
        }

        return query;
    }

    async findChallengesByCreator(userId: string, limit?: number, offset?: number): Promise<Challenge[]> {
        if (!isValidObjectId(userId)) {
            return [];
        }

        const query = this.challengeModel.find({creator: userId})
            .populate({
                path: 'targetResults',
                populate: {path: 'exercise'}
            })
            .sort({createdAt: -1});

        if (limit) {
            query.limit(limit);
        }
        if (offset) {
            query.skip(offset);
        }

        return query;
    }

    async findChallengesByGym(gymId: string, limit?: number, offset?: number): Promise<Challenge[]> {
        if (!isValidObjectId(gymId)) {
            return [];
        }

        const query = this.challengeModel.find({gym: gymId})
            .populate({
                path: 'targetResults',
                populate: {path: 'exercise'}
            })
            .sort({createdAt: -1});

        if (limit) {
            query.limit(limit);
        }
        if (offset) {
            query.skip(offset);
        }

        return query;
    }

    async tryChallenge(challengeId: string, trainingId: string, user: User): Promise<boolean> {
        if (!isValidObjectId(challengeId) || !isValidObjectId(trainingId)) {
            return false;
        }

        const challenge = await this.findChallengeById(challengeId)
        if (!challenge) {
            return false;
        }

        const training = await this.trainingService.findTrainingById(user, trainingId);
        if (!training) {
            return false;
        }

        const userTry = await this.challengeTryService.createTry(challenge, training);

        return userTry.isCompleted;
    }

    async updateChallenge(challengeId: string, user: User, updates: Partial<UpdateChallenge>): Promise<Challenge | null> {
        if (!isValidObjectId(challengeId)) {
            return null;
        }

        const currentChallenge = await this.challengeModel.findById(challengeId);
        if (!currentChallenge || (currentChallenge.creator !== user._id && user.role !== UserRole.ADMIN)) {
            return null;
        }

        let resultIds: string[] = [];
        if (updates.targetResults) {
            if (currentChallenge && currentChallenge.targetResults) {
                await this.resultModel.deleteMany({
                    _id: {$in: currentChallenge.targetResults}
                });
            }

            const createdResults = await this.resultModel.insertMany(updates.targetResults);
            resultIds = createdResults.map(result => result._id);
        }

        const updateData: Partial<Challenge> = {
            ...updates,
            targetResults: resultIds
        };

        const updatedChallenge = await this.challengeModel
            .findByIdAndUpdate(challengeId, updateData, {new: true})
            .populate({
                path: 'targetResults',
                populate: {path: 'exercise'}
            });

        return updatedChallenge ?? null;
    }

    async deleteChallenge(challengeId: string, user: User): Promise<void> {
        if (!isValidObjectId(challengeId)) {
            return;
        }

        const challenge = await this.challengeModel.findById(challengeId);
        if (!challenge || (challenge.creator !== user._id && user.role !== UserRole.ADMIN)) {
            throw new Error("Challenge not found or user does not have permission to delete it");
        }

        if (challenge && challenge.targetResults) {
            await this.resultModel.deleteMany({
                _id: {$in: challenge.targetResults}
            });
        }

        await this.challengeModel.deleteOne({_id: challengeId});
    }
}
