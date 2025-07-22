import { Gym } from "./gym";
import { Result } from "./result";
import { Timestamps } from "./timestamps";
import { User } from "./user";

export interface Challenge extends Timestamps {
  _id: string;
  name: string;
  creator: User | string;
  targetResults: Result[] | string[];
  // If Gym associated, the challenge is specific to that gym
  gym?: Gym | string;
}

