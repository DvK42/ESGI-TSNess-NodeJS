import { Mongoose, Model, isValidObjectId } from "mongoose";

import { Session } from "../models";
import { sessionSchema } from "../mongoose";

export type CreateSession = Omit<Session, '_id' | 'createdAt' | 'updatedAt'>;

export class SessionService {
  readonly model: Model<Session>;

  constructor(public readonly connection: Mongoose) {
    this.model = connection.model('Session', sessionSchema);
  }

  async createSession(session: CreateSession): Promise<Session> {
    return this.model.create(session);
  }

  async findActiveSession(sessionId: string): Promise<Session | null> {
    if(!isValidObjectId(sessionId)) {
        return null;
    }

    // Session + populate User
    const session = this.model.findOne({ _id: sessionId, expirationDate: { $gt: new Date() } }).populate('user');

    return session;
  }
}
