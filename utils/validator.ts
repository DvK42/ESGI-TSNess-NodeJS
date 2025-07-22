import { ResultData } from "../models";

export const validateResultsData = (data: any): boolean => {
  if (data.results && Array.isArray(data.results)) {
    data.results.forEach((result: any) => {
      if (!result.exercise || !result.data) {
        return false;
      }
    });
  }

  return true;
}

export const validateHigherOrEqualResults = (base: ResultData, compare: ResultData): boolean => {
  if (!base || !compare) {
    return false;
  }

  return Object.entries(base).every(([key, value]) => {
    const compareValue = compare[key as keyof ResultData];

    return compareValue !== undefined && compareValue >= value!;
  });
}
