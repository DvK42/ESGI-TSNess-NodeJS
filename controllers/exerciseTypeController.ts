import { Request, Response, Router, json } from "express";
import { ExerciseTypeService, SessionService } from "../services";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { ExerciseType, UserRole } from "../models";

export class ExerciseTypeController {
    constructor(
        public readonly exerciseTypeService: ExerciseTypeService,
        public readonly sessionService: SessionService
    ) { }

    async createExerciseType(req: Request, res: Response) {
        if (
            !req.body ||
            !req.body.name ||
            !req.body.description
        ) {
            res.status(400).json({ error: "Missing required fields: name and description" });
            return;
        }

        try {
            const exerciseType = await this.exerciseTypeService.createExerciseType(req.body as ExerciseType);

            res.status(201).json(exerciseType);
        } catch (error) {
            res.status(500).json({ error: "Failed to create exercise type" });
        }
    }

    async getAllExerciseTypes(req: Request, res: Response) {
        try {
            const exerciseTypes = await this.exerciseTypeService.getAllExerciseTypes();
            res.status(200).json(exerciseTypes);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch exercise types" });
        }
    }

    async getExerciseTypeById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const exerciseType = await this.exerciseTypeService.findExerciseTypeById(id);

            if (!exerciseType) {
                res.status(404).json({ error: "Exercise type not found" });
                return;
            }

            res.status(200).json(exerciseType);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch exercise type" });
        }
    }

    async updateExerciseType(req: Request, res: Response) {
        const { id } = req.params;

        if (
            !req.body ||
            (!req.body.name && !req.body.description)
        ) {
            res.status(400).json({ error: "At least one field (name or description) is required" });
            return;
        }

        try {

            const updatedExerciseType = await this.exerciseTypeService.updateExerciseType(id, req.body);

            if (!updatedExerciseType) {
                res.status(404).json({ error: "Exercise type not found" });
                return;
            }

            res.status(200).json(updatedExerciseType);
        } catch (error) {
            res.status(500).json({ error: "Failed to update exercise type" });
        }
    }

    async deleteExerciseType(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const deleted = await this.exerciseTypeService.deleteExerciseType(id);

            if (!deleted) {
                res.status(404).json({ error: "Exercise type not found" });
                return;
            }

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete exercise type" });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get('/', this.getAllExerciseTypes.bind(this));
        router.get('/:id', this.getExerciseTypeById.bind(this));

        router.post(
            '/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.createExerciseType.bind(this)
        );

        router.put(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateExerciseType.bind(this)
        );

        router.delete(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteExerciseType.bind(this)
        );

        return router;
    }
} 
