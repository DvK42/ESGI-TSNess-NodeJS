import { Exercise } from "./exercise";
import { Timestamps } from "./timestamps";

export interface Result extends Timestamps {
  _id: string;
  exercise: Exercise | string,
  data: ResultData;
}

export interface ResultData {
  nbSeries?: number | string | undefined;
  nbRepetitions?: number | string;
  // In grams
  weight?: number | string;
  // In seconds
  duration?: number | string;
  caloriesBurned?: number | string;
  // Additional data can be added here
  [key: string]: number | string | undefined;
}

