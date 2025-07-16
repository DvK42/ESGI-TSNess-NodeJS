import { Request, Response, Router, json } from "express";

import { SessionService, UserService } from "../services";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models";

export class UserController {
  constructor(
    public readonly userService: UserService,
    public readonly sessionService: SessionService
  ) {
  }

  async createUser(req: Request, res: Response) {
    if(
      !req.body
      || !req.body.email
      || !req.body.password
      || !req.body.lastName
      || !req.body.firstName
    ) {
      res.status(400).end();

      return;
    }

    try {
      const user = await this.userService.createUser({
        email: req.body.email,
        role: UserRole.USER,
        password: req.body.password,
        lastName: req.body.lastName,
        firstName: req.body.firstName
      });

      res.status(201).json(user);
    } catch {
      res.status(409).end();
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.post(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.createUser.bind(this)
    );
    
    return router;
  }
}
