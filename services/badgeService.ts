import { isValidObjectId, Model, Mongoose, Types } from "mongoose";

import { Badge, Challenge, Result, ResultData, User, UserRole } from "../models";
import { badgeSchema, challengeSchema, resultSchema } from "../mongoose";
import { TrainingService } from "./trainingService";
import { validateResults } from "../utils/validator";
import { ChallengeTryService } from "./challengeTryService";

export type CreateBadge = Omit<Badge, '_id' | 'createdAt' | 'updatedAt'> & {
  targetResults?: Array<Omit<Result, '_id' | 'createdAt' | 'updatedAt'>>;
};

export class BadgeService {
  readonly badgeModel: Model<Badge>;
  readonly resultModel: Model<Result>;

  constructor(
    public readonly connection: Mongoose,
  ) {
    this.badgeModel = connection.model('Badge', badgeSchema);
    this.resultModel = connection.model('Result', resultSchema);
  }

  async createBadge(user: User, badge: CreateBadge): Promise<Badge> {
    let resultIds: string[] = [];
    if (badge.targetResults && badge.targetResults.length > 0) {
      const createdResults = await this.resultModel.insertMany(badge.targetResults);
      resultIds = createdResults.map(result => result._id);
    }

    const badgeData = {
      ...badge,
      creator: user._id,
      targetResults: resultIds
    };
    
    return await this.badgeModel.create(badgeData);
  }

  async findAllBadges(): Promise<Badge[]> {
    return await this.badgeModel.find()
      .populate("targetResults");
  }

  async findMissingBadges(userBadgeIds: string[]): Promise<Badge[]> {
    if (!userBadgeIds || userBadgeIds.length === 0) {
      return this.findAllBadges();
    }

    const objectIds = userBadgeIds.map(id => new Types.ObjectId(id));

    return await this.badgeModel.find({
      _id: { $nin: objectIds },
    }).populate("targetResults");
  }
}
