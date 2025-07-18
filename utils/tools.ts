import { config } from "dotenv";

config();

export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_USERNAME = process.env.MONGO_USERNAME;
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
export const FIRST_ACCOUNT_EMAIL = process.env.FIRST_ACCOUNT_EMAIL;
export const FIRST_ACCOUNT_PASSWORD = process.env.FIRST_ACCOUNT_PASSWORD;
