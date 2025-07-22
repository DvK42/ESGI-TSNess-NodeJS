import { Exercise } from "./exercise";
import { Result, ResultData } from "./result";
import { Timestamps } from "./timestamps";

export interface Badge extends Timestamps {
  _id: string;
  name: string;
  isGlobalTargetResults?: boolean;
  targetResults?: Result[] | string[];
  fieldTargetResults?: ResultData[];
}

