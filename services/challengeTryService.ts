import {isValidObjectId, Model, Mongoose} from "mongoose";

import {Challenge, ChallengeTry, Result, ResultData, Training, User, UserRole} from "../models";
import {challengeTrySchema} from "../mongoose";
import {validateResults} from "../utils/validator";
import {UserService} from "./userService";

export class ChallengeTryService {
    readonly challengeTryModel: Model<ChallengeTry>;

    constructor(public readonly connection: Mongoose, public readonly userService: UserService) {
        this.challengeTryModel = connection.model('ChallengeTry', challengeTrySchema);
    }

    async createTry(challenge: Challenge, training: Training): Promise<ChallengeTry> {
        const triesByUser = await this.findTries(training.user.toString());
        const isAlreadyCompleted = triesByUser.some((tryItem) => {
            if (challenge._id.toString() == (tryItem.challenge as Challenge)._id.toString()) {
                return tryItem.isCompleted;
            }
            return false;
        });

        if (isAlreadyCompleted) {
            throw new Error("User has already completed this challenge");
        }

        const targetResults = (challenge.targetResults as Result[]).reduce((acc: {
            [key: string]: ResultData
        }, curr: Result) => ({
            ...acc,
            [typeof curr.exercise === 'string' ? curr.exercise : curr.exercise._id]: curr.data,
        }), {});

        const trainingResults = (training.results as Result[]).reduce((acc: {
            [key: string]: ResultData
        }, curr: Result) => ({
            ...acc,
            [typeof curr.exercise === 'string' ? curr.exercise : curr.exercise._id]: curr.data,
        }), {});

        const isCompleted = Object.entries(targetResults).every(([exerciseId, targetResult]) => {
            if (!trainingResults[exerciseId]) {
                return false;
            }

            return validateResults(targetResult, trainingResults[exerciseId]);
        })

        const createTry = await this.challengeTryModel.create({
            challenge: challenge._id,
            training: training._id,
            isCompleted,
        });

        const populatedTry = await this.challengeTryModel.findById(createTry._id)
            .populate('challenge')
            .populate('training');

        if (!populatedTry) {
            throw new Error("Try not found after creation");
        }

        if (createTry.isCompleted) {
            const user = await this.userService.findUserById(training.user.toString());
            if (user) {
                user.score += 1;
                await this.userService.updateScore(user._id, user.score);
            }
        }

        return populatedTry;
    }

    async findTryById(user: User, tryId: string): Promise<ChallengeTry | null> {
        if (!isValidObjectId(tryId)) {
            return null;
        }

        const userTry = await this.challengeTryModel.findById(tryId)
            .populate('challenge')
            .populate({
                path: 'training',
                populate: {path: 'user'},
            });

        if (!userTry || ((userTry.training as Training).user !== user._id && user.role !== UserRole.ADMIN)) {
            throw new Error("Try not found or user does not have permission to access it");
        }

        return userTry;
    }

    async findTries(userId: string, limit?: number, offset?: number): Promise<ChallengeTry[]> {
        if (!isValidObjectId(userId)) {
            return [];
        }

        const query = this.challengeTryModel.find()
            .populate({
                path: 'training',
                match: {user: userId},
            })
            .populate('challenge')
            .sort({createdAt: -1});

        if (limit) {
            query.limit(limit);
        }
        if (offset) {
            query.skip(offset);
        }

        return query;
    }

    async findTriesByChallenge(userId: string, challengeId: string, limit?: number, offset?: number): Promise<ChallengeTry[]> {
        if (!isValidObjectId(userId) || !isValidObjectId(challengeId)) {
            return [];
        }

        const query = this.challengeTryModel.find({challenge: challengeId})
            .populate({
                path: 'training',
                match: {user: userId},
            })
            .populate('challenge')
            .sort({createdAt: -1});

        if (limit) {
            query.limit(limit);
        }
        if (offset) {
            query.skip(offset);
        }

        return query;
    }

    async deleteTry(tryId: string, user: User): Promise<void> {
        if (!isValidObjectId(tryId)) {
            return;
        }

        const userTry = await this.challengeTryModel.findById(tryId).populate('training');
        if (!userTry || ((userTry.training as Training).user !== user._id && user.role !== UserRole.ADMIN)) {
            throw new Error("Try not found or user does not have permission to delete it");
        }

        await this.challengeTryModel.deleteOne({_id: tryId});
    }
}
