import { Challenge } from "./challenge";
import { Timestamps } from "./timestamps";
import { User } from "./user";

export interface ChallengeGroupTry extends Timestamps {
  _id: string;
  users: User[];
  challenge: Challenge;
  creator: User;
  name: string;
}
