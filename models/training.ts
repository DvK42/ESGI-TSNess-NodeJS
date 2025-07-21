import { Result } from "./result";
import { Timestamps } from "./timestamps";
import { User } from "./user";

export interface Training extends Timestamps {
  _id: string;
  date: Date;
  user: User | string;
  results: Result[] | string[];
  name?: string;
}

