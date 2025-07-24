
import { json, Request, Response, Router } from "express";

import { BadgeService, SessionService, UserBadgeService } from "../services";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models";
import { validateFieldResultsData, validateResultsData } from "../utils/validator";

export class BadgeController {
  constructor(
    public readonly badgeService: BadgeService,
    public readonly sessionService: SessionService,
    public readonly userBadgeService: UserBadgeService,
  ) {}

  async create(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).json({ error: "No Badge data provided" });

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

    if (req.body.fieldTargetResults) {
      if (!validateFieldResultsData(req.body.fieldTargetResults)) {
        res.status(400).json({ error: "Each field path must be string, value must be string or integer, and 'with' key must have object value" });

        return;
      }
    }

    if (req.body.targetResults) {
      if (!validateResultsData(req.body.targetResults)) {
        res.status(400).json({ error: "Each result must have an exercise and data" });

        return;
      }
    }

    try {
      const badge = await this.badgeService.createBadge(user, {
        name: req.body.name,
        isGlobalTargetResults: req.body.isGlobalTargetResults || false,
        targetResults: req.body.targetResults || [],
        fieldTargetResults: req.body.fieldTargetResults || [],
      });

      res.status(201).json(badge);
    } catch (error) {
      console.error('Error creating badge:', error);

      res.status(500).json({ error: "Failed to create badge" });
    }

    this.userBadgeService.updateUserBadges(user._id)
  }

  buildRouter(): Router {
    const router = Router();

    router.post(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.create.bind(this)
    );

    router.get(
      '/',
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getAll.bind(this)
    );

    return router;
  }
}

