import { isValidObjectId, Model, Mongoose } from "mongoose";

import { ChallengeGroupTry, User, UserRole } from "../models";
import { challengeGroupTrySchema } from "../mongoose";

export type CreateChallengeGroupTry = Omit<
  ChallengeGroupTry,
  "_id" | "createdAt" | "updatedAt"
>;

export type UpdateChallengeGroupTry = Partial<
  Omit<
    ChallengeGroupTry,
    "_id" | "createdAt" | "updatedAt" | "creator" | "challenge"
  >
>;

export class ChallengeGroupTryService {
  readonly challengeGroupTryModel: Model<ChallengeGroupTry>;

  constructor(public readonly connection: Mongoose) {
    this.challengeGroupTryModel = connection.model(
      "ChallengeGroupTry",
      challengeGroupTrySchema
    );
  }

  async createGroup(
    group: CreateChallengeGroupTry
  ): Promise<ChallengeGroupTry> {
    const createdGroup = await this.challengeGroupTryModel.create(group);
    if (!createdGroup) {
      throw new Error("Group not found after creation");
    }

    return createdGroup;
  }

  async getAllGroups(
    limit?: number,
    offset?: number
  ): Promise<ChallengeGroupTry[]> {
    const query = this.challengeGroupTryModel
      .find({})
      .populate("users")
      .populate("challenge")
      .populate("creator")
      .sort({ createdAt: -1 });
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.skip(offset);
    }
    return query;
  }

  async findGroupById(
    user: User,
    groupId: string
  ): Promise<ChallengeGroupTry | null> {
    if (!isValidObjectId(groupId)) {
      return null;
    }

    const group = await this.challengeGroupTryModel
      .findById(groupId)
      .populate("users")
      .populate("challenge")
      .populate("creator");

    if (
      !group ||
      (!group.users.some(
        (userGroup) => userGroup._id.toString() === user._id.toString()
      ) &&
        group.creator._id.toString() !== user._id.toString())
    ) {
      throw new Error(
        "Group not found or user does not have permission to access it"
      );
    }

    return group;
  }

  async findGroupsByUser(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ChallengeGroupTry[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    const query = this.challengeGroupTryModel
      .find({
        $or: [{ users: userId }, { creator: userId }],
      })
      .populate("users")
      .populate("challenge")
      .populate("creator")
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.skip(offset);
    }

    return query;
  }

  async updateGroup(
    groupId: string,
    user: User,
    updates: Partial<UpdateChallengeGroupTry>
  ): Promise<ChallengeGroupTry | null> {
    if (!isValidObjectId(groupId)) {
      return null;
    }

    const currentGroup = await this.challengeGroupTryModel.findById(groupId);
    if (
      !currentGroup ||
      currentGroup.creator._id.toString() !== user._id.toString()
    ) {
      return null;
    }

    const updatedGroup = await this.challengeGroupTryModel
      .findByIdAndUpdate(groupId, updates, { new: true })
      .populate("users")
      .populate("challenge")
      .populate("creator");

    return updatedGroup ?? null;
  }

  async deleteGroup(groupId: string, user: User): Promise<void> {
    if (!isValidObjectId(groupId)) {
      return;
    }

    const group = await this.challengeGroupTryModel.findById(groupId);

    if (
      !group ||
      (group.creator._id.toString() !== user._id.toString() &&
        user.role !== UserRole.ADMIN)
    ) {
      throw new Error(
        "Group not found or user does not have permission to delete it"
      );
    }

    await this.challengeGroupTryModel.deleteOne({ _id: groupId });
  }

  async userExitGroup(userId: string, groupId: string): Promise<void> {
    if (!isValidObjectId(userId) || !isValidObjectId(groupId)) {
      return;
    }

    await this.challengeGroupTryModel.updateOne(
      { _id: groupId },
      { $pull: { users: userId } }
    );
  }
}
