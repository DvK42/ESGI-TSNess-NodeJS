import { Challenge } from "./challenge";
import { Gym } from "./gym";
import { Result } from "./result";
import { Timestamps } from "./timestamps";
import { Training } from "./training";

export interface ChallengeTry extends Timestamps {
  _id: string;
  challenge: Challenge | string;
  training: Training | string;
  isCompleted: boolean;
}

