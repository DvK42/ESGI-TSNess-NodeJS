import { isValidObjectId, Model, Mongoose } from "mongoose";

import { userBadgeSchema } from "../mongoose";
import { TrainingService } from "./trainingService";
import {
  validateFieldBadge,
  validateGlobalBadge,
  validateTrainingBadge,
} from "../utils/validator";
import { BadgeService } from "./badgeService";
import { User, UserBadge } from "../models";
import { UserService } from "./userService";

export class UserBadgeService {
  readonly userBadgeModel: Model<UserBadge>;

  constructor(
    public readonly connection: Mongoose,
    public readonly badgeService: BadgeService,
    public readonly trainingService: TrainingService,
    public readonly userService: UserService,
  ) {
    this.userBadgeModel = connection.model('UserBadge', userBadgeSchema);
  }

  async updateUserBadges(userId: string): Promise<void> {
    if (!isValidObjectId(userId)) {
      return;
    }

    const userBadges = await this.userBadgeModel.find({ user: userId })
    
    const [badges, trainings, populatedUser] = await Promise.all([
      this.badgeService.findMissingBadges(userBadges.map(userBadge => userBadge.badge as string)),
      this.trainingService.findTrainingsByUser(userId),
      this.userService.findUserById(userId),
    ]);

    badges.forEach(badge => {
      let isCompleted = false;

      if (badge.targetResults && badge.targetResults.length > 0) {
        isCompleted = badge.isGlobalTargetResults
          ? validateGlobalBadge(badge, trainings)
          : trainings.some(training => validateTrainingBadge(badge, training));
      } else if (badge.fieldTargetResults) {
        if (!populatedUser) {
          return;
        }

        isCompleted = validateFieldBadge(badge, populatedUser);
      }

      if (isCompleted) {
        const userBadge = new this.userBadgeModel({
          user: userId,
          badge: badge._id,
        });
        
        this.userBadgeModel.create(userBadge);
      }
    });
  }

  async findUserBadges(userId: string): Promise<UserBadge[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    return this.userBadgeModel.find({ user: userId })
      .populate('badge');
  }
}
