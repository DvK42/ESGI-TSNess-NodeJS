import { isValidObjectId, Model, Mongoose } from "mongoose";

import { Challenge, ChallengeTry, Training, User, UserRole } from "../models";
import { challengeTrySchema } from "../mongoose";

export class ChallengeTryService {
  readonly challengeTryModel: Model<ChallengeTry>;

  constructor(public readonly connection: Mongoose) {
    this.challengeTryModel = connection.model('ChallengeTry', challengeTrySchema);
  }

  async createTry(challenge: Challenge, training: Training): Promise<ChallengeTry> {
    const createTry = await this.challengeTryModel.create({
      challenge: challenge._id,
      training: training._id,
    });

    const populatedTry = await this.challengeTryModel.findById(createTry._id)
      .populate('challenge')
      .populate('training');

    if (!populatedTry) {
      throw new Error("Try not found after creation");
    }

    return populatedTry;
  }

  async findTries(userId: string, limit?: number, offset?: number): Promise<ChallengeTry[]> {
    const query = this.challengeTryModel.find({ training: { user: userId } })
      .populate('training')
      .populate('challenge')
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.skip(offset);
    }

    return query;
  }

  async findTriesByChallenge(userId: string, challengeId: string, limit?: number, offset?: number): Promise<ChallengeTry[]> {
    const query = this.challengeTryModel.find({ challenge: { _id: challengeId }, training: { user: userId } })
      .populate('training')
      .populate('challenge')
      .sort({ createdAt: -1 });

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

    await this.challengeTryModel.deleteOne({ _id: tryId });
  }
}
