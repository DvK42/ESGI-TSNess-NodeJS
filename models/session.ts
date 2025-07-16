import { User } from "./user";
import { Timestamps } from "./timestamps";

export interface Session extends Timestamps {
  _id: string;
  user: string | User;
  expirationDate?: Date;
}
