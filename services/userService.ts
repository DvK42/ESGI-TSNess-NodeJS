import { Mongoose, Model, FilterQuery, isValidObjectId } from "mongoose";

import { User, UserRole } from "../models";
import { userSchema } from "../mongoose";
import { sha256 } from "../utils/security";

export type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>;

export class UserService {
  readonly model: Model<User>;

  constructor(public readonly connection: Mongoose) {
    this.model = connection.model('User', userSchema);
  }

  async findUser(email: string, password?: string): Promise<User | null> {
    const filter: FilterQuery<User> = { email: email };

    if(password) {
        filter.password = sha256(password);
    }

    return this.model.findOne(filter);
  }

  async createUser(user: CreateUser): Promise<User> {
      return this.model.create({...user, password: sha256(user.password)});
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
      if(!isValidObjectId(userId)) {
          return;
      }

      await this.model.updateOne({
          _id: userId
      }, {
          role: role
      });
  }
}
