import { Request, RequestHandler } from "express";

import { getUserRoleLevel, UserRole } from "../models";

export const roleMiddleware = (require: UserRole): RequestHandler => {
  const targetRoleLevel = getUserRoleLevel(require);

  return async (req: Request, res, next) => {
    if(!req.user) {
      res.status(401).end();

      return;
    }

    if(getUserRoleLevel(req.user.role) < targetRoleLevel) {
      res.status(403).end();

      return;
    }

    next();
  };
}
