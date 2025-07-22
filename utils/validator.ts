import { ResultData } from "../models";
import { Operator } from "./enums/operator";

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

export const validateResults = (base: ResultData, compare: ResultData): boolean => {
  if (!base || !compare) {
    return false;
  }

  return Object.entries(base).every(([key, value]) => {
    const compareValue = compare[key as keyof ResultData];
    if (compareValue === undefined) {
      return false;
    }

    if (typeof value === 'string'){
      switch (true) {
        case value.startsWith(Operator.EQUAL):
          return compareValue === parseInt(value.replace(Operator.EQUAL, ''));
        case value.startsWith(Operator.NOT_EQUAL):
          return compareValue !== parseInt(value.replace(Operator.NOT_EQUAL, ''));
        case value.startsWith(Operator.GREATER_THAN):
          return compareValue > parseInt(value.replace(Operator.GREATER_THAN, ''));
        case value.startsWith(Operator.LESS_THAN):
          return compareValue < parseInt(value.replace(Operator.LESS_THAN, ''));
        case value.startsWith(Operator.GREATER_THAN_OR_EQUAL):
          return compareValue >= parseInt(value.replace(Operator.GREATER_THAN_OR_EQUAL, ''));
        case value.startsWith(Operator.LESS_THAN_OR_EQUAL):
          return compareValue <= parseInt(value.replace(Operator.LESS_THAN_OR_EQUAL, ''));
        default:
          return compareValue > parseInt(value, 10);
      }
    }

    return compareValue >= value;
  })
}
