import { Mongoose, connect } from "mongoose";
import { MONGO_DB_NAME, MONGO_PASSWORD, MONGO_URI, MONGO_USERNAME } from "../../utils/tools";

export const openConnection = (): Promise<Mongoose> => {
  if(MONGO_URI === undefined) {
    throw new Error('MONGO_URI is not defined');
  }

  if(MONGO_USERNAME === undefined) {
    throw new Error('MONGO_USERNAME is not defined');
  }

  if(MONGO_PASSWORD === undefined) {
    throw new Error('MONGO_PASSWORD is not defined');
  }

  if(MONGO_DB_NAME === undefined) {
    throw new Error('MONGO_DB_NAME is not defined');
  }

  return connect(MONGO_URI, {
    auth: {
      username: MONGO_USERNAME,
      password: MONGO_PASSWORD,
    },
    authSource: 'admin',
    dbName: MONGO_DB_NAME
  });
}
