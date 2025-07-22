import { Request, Response, Router } from "express";

import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models";
import { ChallengeTryService, SessionService } from "../services";

export class ChallengeTryController {
  constructor(
    public readonly challengeTryService: ChallengeTryService,
    public readonly sessionService: SessionService,
  ) {}

  async getTry(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no try ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not create ressource, user not provided" });

      return;
    }

    try {
      const userTry = await this.challengeTryService.findTryById(user, id);
      if (!userTry) {
        res.status(404).json({ error: "Try not found" });
      
        return;
      }

      res.json(userTry);
    } catch (error) {
      console.error('Error getting try:', error);

      res.status(500).json({ error: "Failed to get try" });
    }
  }

  async getTryByChallenge(req: Request, res: Response) {
    const { challengeId } = req.params;
    if (!challengeId) {
      res.status(400).json({ error: "Can not find ressource, no challenge ID provided" });

      return;
    }

    const userId = req.user?._id ?? undefined;
    if (!userId) {
      res.status(401).json({ error: "Can not create ressource, user not provided" });

      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    try {
      const userTries = await this.challengeTryService.findTriesByChallenge(userId, challengeId, limit, offset);
      if (!userTries) {
        res.status(404).json({ error: "Tries not found" });
      
        return;
      }

      res.json(userTries);
    } catch (error) {
      console.error('Error getting tries:', error);

      res.status(500).json({ error: "Failed to get try" });
    }
  }

  async getTries(req: Request, res: Response) {
    const userId = req.user?._id ?? undefined;
    if (!userId) {
      res.status(401).json({ error: "Can not access ressource, user not provided" });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    try {
      const tries = await this.challengeTryService.findTries(userId, limit, offset);

      res.json(tries);
    } catch (error) {
      console.error('Error getting challenge tries by user:', error);

      res.status(500).json({ error: "Failed to get challenge tries" });
    }
  }

   async deleteTry(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no try ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not find ressource, user not provided" });

      return;
    }

    try {
      await this.challengeTryService.deleteTry(id, user);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting try:', error);

      res.status(500).json({ error: "Failed to delete try" });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.get(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getTries.bind(this)
    );

    router.get(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getTry.bind(this)
    );

    router.get(
      '/challenge/:challengeId',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getTryByChallenge.bind(this)
    );

    router.delete(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.deleteTry.bind(this)
    );

    return router;
  }
}

