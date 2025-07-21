import { Exercise } from "./exercise";
import { Timestamps } from "./timestamps";

export interface Result extends Timestamps {
  _id: string;
  exercise: Exercise | string,
  data: ResultData;
}

export interface ResultData {
  nbSeries?: number;
  nbRepetitions?: number;
  // In grams
  weight?: number;
  // In seconds
  duration?: number;
  caloriesBurned?: number;
  // Additional data can be added here
}

