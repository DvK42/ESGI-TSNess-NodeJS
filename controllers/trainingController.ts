import { json, Request, Response, Router } from "express";

import { TrainingService, SessionService, UserBadgeService } from "../services";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models";
import { validateResultsData } from "../utils/validator";

export class TrainingController {
  constructor(
    public readonly trainingService: TrainingService,
    public readonly sessionService: SessionService,
    public readonly userBadgeService: UserBadgeService,
  ) {}

  async createTraining(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).json({ error: "No training data provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not create ressource, user not provided" });

      return;
    }

    if (req.body.results) {
      if (!validateResultsData(req.body.results)) {
        res.status(400).json({ error: "Each result must have an exercise and data" });

        return;
      }
    }

    try {
      const training = await this.trainingService.createTraining(user, {
        date: req.body.date ?? new Date(),
        name: req.body.name ?? null,
        results: req.body.results || []
      });

      res.status(201).json(training);
    } catch (error) {
      console.error('Error creating training:', error);

      res.status(500).json({ error: "Failed to create training" });

      return;
    }

    this.userBadgeService.updateUserBadges(user._id)
  }

  async getTraining(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no training ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not create ressource, user not provided" });

      return;
    }

    try {
      const training = await this.trainingService.findTrainingById(user, id);
      if (!training) {
        res.status(404).json({ error: "Training not found" });
      
        return;
      }

      res.json(training);
    } catch (error) {
      console.error('Error getting training:', error);

      res.status(500).json({ error: "Failed to get training" });
    }
  }

  async getTrainingsByUser(req: Request, res: Response) {
    const userId = req.user?._id ?? undefined;
    if (!userId) {
      res.status(401).json({ error: "Can not find ressource, user not provided" });

      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    try {
      const trainings = await this.trainingService.findTrainingsByUser(userId, limit, offset);

      res.json(trainings);
    } catch (error) {
      console.error('Error getting trainings by user:', error);

      res.status(500).json({ error: "Failed to get trainings" });
    }
  }

  async updateTraining(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no training ID provided" });

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

    if (req.body.results) {
      if (!validateResultsData(req.body.results)) {
        res.status(400).json({ error: "Each result must have an exercise and data" });

        return;
      }
    }

    try {
      const updatedTraining = await this.trainingService.updateTraining(id, user, req.body);
      if (!updatedTraining) {
        res.status(404).json({ error: "Training not found" });

        return;
      }

      res.json(updatedTraining);
    } catch (error) {
      console.error('Error updating training:', error);

      res.status(500).json({ error: "Failed to update training" });
    }

    this.userBadgeService.updateUserBadges(user._id)
  }

  async deleteTraining(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Can not find ressource, no training ID provided" });

      return;
    }

    const user = req.user ?? undefined;
    if (!user) {
      res.status(401).json({ error: "Can not find ressource, user not provided" });

      return;
    }

    try {
      await this.trainingService.deleteTraining(id, user);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting training:', error);

      res.status(500).json({ error: "Failed to delete training" });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.post(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      json(),
      this.createTraining.bind(this)
    );

    router.get(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getTraining.bind(this)
    );

    router.get(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getTrainingsByUser.bind(this)
    );

    router.put(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      json(),
      this.updateTraining.bind(this)
    );

    router.delete(
      '/:id',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.deleteTraining.bind(this)
    );

    return router;
  }
}
