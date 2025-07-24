import { json, Request, Response, Router } from "express";

import { ChallengeService, SessionService } from "../services";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models";
import { validateResultsData } from "../utils/validator";

export class ChallengeController {
  constructor(
    public readonly challengeService: ChallengeService,
    public readonly sessionService: SessionService
  ) {}

  async createChallenge(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).json({ error: "No challenge data provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not create ressource, user not provided" });

      return;
    }

    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      res.status(400).json({ error: "Challenge name is required and must be a non-empty string" });

      return;
    }

    if (req.body.targetResults) {
      if (!validateResultsData(req.body.targetResults)) {
        res.status(400).json({ error: "Each result must have an exercise and data" });

        return;
      }
    }

    try {
      const challenge = await this.challengeService.createChallenge(user, {
        name: req.body.name,
        targetResults: req.body.targetResults || []
      });

      res.status(201).json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);

      res.status(500).json({ error: "Failed to create challenge" });
    }
  }

  async getChallenge(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no challenge ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not create ressource, user not provided" });

      return;
    }

    try {
      const challenge = await this.challengeService.findChallengeById(id);
      if (!challenge) {
        res.status(404).json({ error: "Challenge not found" });
      
        return;
      }

      res.json(challenge);
    } catch (error) {
      console.error('Error getting challenge:', error);

      res.status(500).json({ error: "Failed to get challenge" });
    }
  }

  async getChallenges(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    try {
      const challenges = await this.challengeService.findChallenges(limit, offset);

      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges by user:', error);

      res.status(500).json({ error: "Failed to get challenges" });
    }
  }

  async getChallengesByCreator(req: Request, res: Response) {
    const creatorId = req.params.creatorId;
    if (!creatorId) {
      res.status(400).json({ error: "Can not find ressource, creator not provided" });

      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    try {
      const challenges = await this.challengeService.findChallengesByCreator(creatorId, limit, offset);

      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges by user:', error);

      res.status(500).json({ error: "Failed to get challenges" });
    }
  }

  async getChallengesByGym(req: Request, res: Response) {
    const gymId = req.params.gymId;
    if (!gymId) {
      res.status(400).json({ error: "Can not find ressource, gym not provided" });

      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    try {
      const challenges = await this.challengeService.findChallengesByGym(gymId, limit, offset);

      res.json(challenges);
    } catch (error) {
      console.error('Error getting challenges by user:', error);

      res.status(500).json({ error: "Failed to get challenges" });
    }
  }

  async tryChallenge(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not try, no challenge ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not try, user not provided" });

      return;
    }

    if (req.body.trainingId && typeof req.body.trainingId !== 'string') {
      res.status(400).json({ error: "Training ID must be a string" });

      return;
    }

    try {
      const isCompleted = await this.challengeService.tryChallenge(id, req.body.trainingId, user);

      return res.json({ completed: isCompleted });
    } catch (error) {
      console.error('Error trying challenge:', error);

      res.status(500).json({ error: "Failed to try challenge" });
    }
  }

  async updateChallenge(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no challenge ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not find ressource, user not provided" });

      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: "No update data provided" });

      return;
    }

    if (req.body.targetResults) {
      if (!validateResultsData(req.body.targetsResults)) {
        res.status(400).json({ error: "Each result must have an exercise and data" });

        return;
      }
    }

    try {
      const updatedChallenge = await this.challengeService.updateChallenge(id, user, req.body);
      if (!updatedChallenge) {
        res.status(404).json({ error: "Challenge not found" });

        return;
      }

      res.json(updatedChallenge);
    } catch (error) {
      console.error('Error updating challenge:', error);

      res.status(500).json({ error: "Failed to update challenge" });
    }
  }

  async deleteChallenge(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no challenge ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not find ressource, user not provided" });

      return;
    }

    try {
      await this.challengeService.deleteChallenge(id, user);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting challenge:', error);

      res.status(500).json({ error: "Failed to delete challenge" });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.post(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      json(),
      this.createChallenge.bind(this)
    );

    router.post(
      '/:id/try',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      json(),
      this.tryChallenge.bind(this)
    );

    router.get(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getChallenges.bind(this)
    );

    router.get(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getChallenge.bind(this)
    );

    router.get(
      '/creator/:creatorId',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getChallengesByCreator.bind(this)
    );

    router.get(
      '/gym/:gymId',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getChallengesByGym.bind(this)
    );

    router.put(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      json(),
      this.updateChallenge.bind(this)
    );

    router.delete(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.deleteChallenge.bind(this)
    );

    return router;
  }
}

