import { Badge, Result, ResultData, Training, User } from "../models";
import { Filter } from "./enums/filter";
import { Operator } from "./enums/operator";

type isCompletedProps = {
  [key: string]: ResultData;
}

const isCompleted = (targetResults: isCompletedProps, compareResults: isCompletedProps): boolean => {
  return Object.entries(targetResults).every(([exerciseId, targetResult]) => {
    if (!compareResults[exerciseId]) {
      return false;
    }

    return validateResults(targetResult, compareResults[exerciseId]);
  })
}

const assertCompare = (compareValue: number, value: string | number): boolean => {
  if (typeof value === 'string'){
    switch (true) {
      case value.startsWith(Operator.GREATER_THAN_OR_EQUAL):
        return compareValue >= parseInt(value.replace(Operator.GREATER_THAN_OR_EQUAL, ''));
      case value.startsWith(Operator.LESS_THAN_OR_EQUAL):
        return compareValue <= parseInt(value.replace(Operator.LESS_THAN_OR_EQUAL, ''));
      case value.startsWith(Operator.GREATER_THAN):
        return compareValue > parseInt(value.replace(Operator.GREATER_THAN, ''));
      case value.startsWith(Operator.LESS_THAN):
        return compareValue < parseInt(value.replace(Operator.LESS_THAN, ''));
      case value.startsWith(Operator.EQUAL):
        return compareValue === parseInt(value.replace(Operator.EQUAL, ''));
      case value.startsWith(Operator.NOT_EQUAL):
        return compareValue !== parseInt(value.replace(Operator.NOT_EQUAL, ''));
      default:
        return compareValue >= parseInt(value, 10);
    }
  }

  return compareValue >= value;
}

export const validateResultsData = (results: any): boolean => {
  if (!Array.isArray(results)) {
    return false;
  }

  results.forEach((result: any) => {
    if (!result.exercise || !result.data) {
      return false;
    }
  });

  return true;
}

export const validateFieldResultsData = (results: any): boolean => {
  if (!Array.isArray(results)) {
    return false;
  }

  const isValid = results.map((result: object) => {
    const isLineValid = Object.entries(result).map(([key, value]: [any, any]) => {
      if (key === 'with') {
        return typeof value === 'object';
      }

      if (typeof key !== 'string' || !['string', 'number'].includes(typeof value)) {
        return false;
      }

      return true;
    });

    return isLineValid.every((valid: boolean) => valid);
  });

  return isValid.every((valid: boolean) => valid);
}

export const validateResults = (base: ResultData, compare: ResultData): boolean => {
  if (!base || !compare) {
    return false;
  }

  return Object.entries(base).every(([key, value]) => {
    const compareValue = compare[key as keyof ResultData];
    if (value === undefined || compareValue === undefined || typeof compareValue !== 'number') {
      return false;
    }

    return assertCompare(compareValue, value);
  })
}

export const validateGlobalBadge = (badge: Badge, trainings: Training[]): boolean => {
  if (!badge.targetResults || typeof !badge.targetResults[0] === 'string') {
    return false;
  }

  const targetResults = (badge.targetResults as Result[]).reduce((acc: { [key: string]: ResultData }, curr: Result) => ({
    ...acc,
    [typeof curr.exercise === 'string' ? curr.exercise : curr.exercise._id]: curr.data,
  }), {});

  const globalTrainingResults: { [key: string]: ResultData }= {};
  trainings.forEach((training: Training) => {
    (training.results as Result[]).forEach((result: Result) => {
      const exerciseId = typeof result.exercise === 'string' ? result.exercise : result.exercise._id;
      if (!globalTrainingResults[exerciseId]) {
        globalTrainingResults[exerciseId] = {};
      }

      Object.entries(result.data).forEach(([key, value]) => {
        if (typeof value !== 'number') {
          return;
        }

        if (!globalTrainingResults[exerciseId][key]) {
          globalTrainingResults[exerciseId][key] = 0;
        }
        (globalTrainingResults[exerciseId][key] as number) += value;
      });
    });
  })

  return isCompleted(targetResults, globalTrainingResults);
}

export const validateTrainingBadge = (badge: Badge, training: Training): boolean => {
  if (!badge.targetResults || typeof !badge.targetResults[0] === 'string' || !training.results || typeof !training.results[0] === 'string') {
    return false;
  }

  const targetResults = (badge.targetResults as Result[]).reduce((acc: { [key: string]: ResultData }, curr: Result) => ({
    ...acc,
    [typeof curr.exercise === 'string' ? curr.exercise : curr.exercise._id]: curr.data,
  }), {});

  const trainingResults = (training.results as Result[]).reduce((acc: { [key: string]: ResultData }, curr: Result) => ({
    ...acc,
    [typeof curr.exercise === 'string' ? curr.exercise : curr.exercise._id]: curr.data,
  }), {});

  return isCompleted(targetResults, trainingResults);
}

export const validateFieldBadge = (badge: Badge, user: User): boolean => {
  if (!badge.fieldTargetResults) {
    return false;
  }

  return badge.fieldTargetResults.every((fieldResult: ResultData) => {
    if (fieldResult.with && typeof fieldResult.with === 'object') {
      // todo implement
    }

    let fireldResultParsed = fieldResult;
    if (typeof fieldResult === 'string') {
      fireldResultParsed = JSON.parse(fieldResult);
    }

    return Object.entries(fireldResultParsed).every(([key, value]) => {
      if (key === 'with') {
        // todo implement
      }

      if (typeof key !== 'string' || !value || !['string', 'number'].includes(typeof value)) {
        return false;
      }
      
      const parts = key.split('|');
      const path = parts[0];
      const filters = parts.slice(1);

      const targetField = user[path as keyof User];
      if (!targetField) {
        return false;
      }

      const compareValue = filters.reduce((acc: any, filter: string) => {
        switch (filter) {
          case Filter.LENGTH:
            return acc.length;
          default:
            // See to return 509 status
            throw new Error(`Unknown filter: ${filter}`);
        } 
      }, targetField);

      return assertCompare(compareValue, value);
    });
  });
}
