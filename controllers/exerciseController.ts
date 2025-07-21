import { Request, Response, Router, json } from "express";
import { ExerciseService, SessionService } from "../services";
import { Exercise, UserRole } from "../models";
import { Difficulty } from "../utils/enums/difficulty";
import { roleMiddleware, sessionMiddleware } from "../middlewares";

export class ExerciseController {
    constructor(
        public readonly exerciseService: ExerciseService,
        public readonly sessionService: SessionService
    ) { }

    async createExercise(req: Request, res: Response) {
        if (!req.body || !req.body.name || !req.body.description || !req.body.difficulty || !req.body.equipment || !req.body.nbSeries || !req.body.nbRepetitions) {
            res.status(400).json({ error: "Missing required fields: name, description, difficulty, equipment, nbSeries, nbRepetitions" });
            return;
        }

        if (!Object.values(Difficulty).includes(req.body.difficulty)) {
            res.status(400).json({
                error: "Invalid difficulty",
                validDifficulties: Object.values(Difficulty)
            });
            return;
        }

        if (req.body.nbSeries < 1) {
            res.status(400).json({ error: "Number of series must be at least 1" });
            return;
        }

        if (req.body.nbRepetitions < 1) {
            res.status(400).json({ error: "Number of repetitions must be at least 1" });
            return;
        }

        try {
            const exercise = await this.exerciseService.createExercise(req.body as Exercise);
            res.status(201).json(exercise);
        } catch (error) {
            console.error('Error creating exercise:', error);
            res.status(500).json({ error: "Failed to create exercise" });
        }
    }

    async getAllExercises(req: Request, res: Response) {
        try {
            const exercises = await this.exerciseService.getAllExercises();
            res.status(200).json(exercises);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch exercises" });
        }
    }

    async getExerciseById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const exercise = await this.exerciseService.findExerciseById(id);

            if (!exercise) {
                res.status(404).json({ error: "Exercise not found" });
                return;
            }

            res.status(200).json(exercise);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch exercise" });
        }
    }

    async updateExercise(req: Request, res: Response) {
        const { id } = req.params;

        if (!req.body || (!req.body.name && !req.body.description && !req.body.difficulty && !req.body.equipment && !req.body.nbSeries && !req.body.nbRepetitions)) {
            res.status(400).json({ error: "At least one field is required" });
            return;
        }

        if (req.body.difficulty && !Object.values(Difficulty).includes(req.body.difficulty)) {
            res.status(400).json({
                error: "Invalid difficulty",
                validDifficulties: Object.values(Difficulty)
            });
            return;
        }

        if (req.body.nbSeries !== undefined && req.body.nbSeries < 1) {
            res.status(400).json({ error: "Number of series must be at least 1" });
            return;
        }

        if (req.body.nbRepetitions !== undefined && req.body.nbRepetitions < 1) {
            res.status(400).json({ error: "Number of repetitions must be at least 1" });
            return;
        }

        try {
            const updatedExercise = await this.exerciseService.updateExercise(id, req.body);

            if (!updatedExercise) {
                res.status(404).json({ error: "Exercise not found" });
                return;
            }

            res.status(200).json(updatedExercise);
        } catch (error) {
            res.status(500).json({ error: "Failed to update exercise" });
        }
    }

    async deleteExercise(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const deleted = await this.exerciseService.deleteExercise(id);

            if (!deleted) {
                res.status(404).json({ error: "Exercise not found" });
                return;
            }

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete exercise" });
        }
    }

    async getExercisesByDifficulty(req: Request, res: Response) {
        const { difficulty } = req.params;

        if (!Object.values(Difficulty).includes(difficulty as Difficulty)) {
            res.status(400).json({
                error: "Invalid difficulty",
                validDifficulties: Object.values(Difficulty)
            });
            return;
        }

        try {
            const exercises = await this.exerciseService.findExercisesByDifficulty(difficulty);
            res.status(200).json(exercises);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch exercises by difficulty" });
        }
    }

    async getExercisesByEquipment(req: Request, res: Response) {
        const { equipmentId } = req.params;

        try {
            const exercises = await this.exerciseService.findExercisesByEquipment(equipmentId);
            res.status(200).json(exercises);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch exercises by equipment" });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get('/', this.getAllExercises.bind(this));
        router.get('/difficulty/:difficulty', this.getExercisesByDifficulty.bind(this));
        router.get('/equipment/:equipmentId', this.getExercisesByEquipment.bind(this));
        router.get('/:id', this.getExerciseById.bind(this));

        router.post(
            '/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.createExercise.bind(this)
        );

        router.put(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateExercise.bind(this)
        );

        router.delete(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteExercise.bind(this)
        );

        return router;
    }
} 
