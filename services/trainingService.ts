import { isValidObjectId, Model, Mongoose } from "mongoose";

import { Training, Result, User, UserRole } from "../models";
import { trainingSchema, resultSchema } from "../mongoose";

export type CreateTraining = Omit<Training, '_id' | 'createdAt' | 'updatedAt' | 'user'> & {
  results?: Array<Omit<Result, '_id' | 'createdAt' | 'updatedAt'>>;
};

export type UpdateTraining = Partial<Omit<Training, '_id' | 'createdAt' | 'updatedAt' | 'user'>> & {
  results?: Array<Omit<Result, '_id' | 'createdAt' | 'updatedAt'>>;
};

export class TrainingService {
  readonly trainingModel: Model<Training>;
  readonly resultModel: Model<Result>;

  constructor(public readonly connection: Mongoose) {
    this.trainingModel = connection.model('Training', trainingSchema);
    this.resultModel = connection.model('Result', resultSchema);
  }

  async createTraining(user: User, training: CreateTraining): Promise<Training> {
    let resultIds: string[] = [];
    if (training.results && training.results.length > 0) {
      const createdResults = await this.resultModel.insertMany(training.results);
      resultIds = createdResults.map(result => result._id);
    }

    const trainingData = {
      ...training,
      user: user._id,
      results: resultIds
    };
    
    const createdTraining = await this.trainingModel.create(trainingData);
    const populatedTraining = await this.findTrainingById(user, createdTraining._id);
    if (!populatedTraining) {
      throw new Error("Training not found after creation");
    }

    return populatedTraining;
  }

  async findTrainingById(user: User, trainingId: string): Promise<Training | null> {
    if (!isValidObjectId(trainingId)) {
      return null;
    }

    const training = await this.trainingModel.findById(trainingId)
      .populate({
        path: 'results',
        populate: { path: 'exercise' }
      });

    if (!training || (training.user !== user._id && user.role !== UserRole.ADMIN)) {
      throw new Error("Training not found or user does not have permission to delete it");
    }

    return training;
  }

  async findTrainingsByUser(userId: string, limit?: number, offset?: number): Promise<Training[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }
    
    const query = this.trainingModel.find({ user: userId })
      .populate({
        path: 'results',
        populate: { path: 'exercise' }
      })
      .sort({ date: -1 });

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.skip(offset);
    }

    return query;
  }

  async updateTraining(trainingId: string, user: User, updates: Partial<UpdateTraining>): Promise<Training | null> {
    if (!isValidObjectId(trainingId)) {
      return null;
    }

    const currentTraining = await this.trainingModel.findById(trainingId);
    if (!currentTraining || (currentTraining.user !== user._id && user.role !== UserRole.ADMIN)) {
      return null;
    }

    let resultIds: string[] = [];
    if (updates.results) {
      if (currentTraining && currentTraining.results) {
        await this.resultModel.deleteMany({
            _id: { $in: currentTraining.results }
        });
      }

      const createdResults = await this.resultModel.insertMany(updates.results);
      resultIds = createdResults.map(result => result._id);
    }

    const updateData: Partial<Training> = {
      ...updates,
      results: resultIds 
    }; 

    const updatedTraining = await this.trainingModel
      .findByIdAndUpdate(trainingId, updateData, { new: true })
      .populate({
        path: 'results',
        populate: { path: 'exercise' }
      });

    return updatedTraining ?? null;
  }

  async deleteTraining(trainingId: string, user: User): Promise<void> {
    if (!isValidObjectId(trainingId)) {
      return;
    }

    const training = await this.trainingModel.findById(trainingId);

    if (!training || (training.user !== user._id && user.role !== UserRole.ADMIN)) {
      throw new Error("Training not found or user does not have permission to delete it");
    }

    if (training && training.results) {
      await this.resultModel.deleteMany({
        _id: { $in: training.results }
      });
    }
    
    await this.trainingModel.deleteOne({ _id: trainingId });
  }
}
