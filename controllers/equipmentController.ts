import { Request, Response, Router, json } from "express";
import { EquipmentService } from "../services";
import { Equipment, Muscle, UserRole } from "../models";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { SessionService } from "../services";

export class EquipmentController {
    constructor(
        public readonly equipmentService: EquipmentService,
        public readonly sessionService: SessionService
    ) { }

    async createEquipment(req: Request, res: Response) {
        if (!req.body || !req.body.name || !req.body.description || !req.body.targetedMuscles || !req.body.exercicesTypes) {
            res.status(400).json({ error: "Missing required fields: name, description, targetedMuscles, exercicesTypes" });
            return;
        }

        if (!Array.isArray(req.body.targetedMuscles)) {
            res.status(400).json({ error: "targetedMuscles must be an array" });
            return;
        }

        if (!Array.isArray(req.body.exercicesTypes)) {
            res.status(400).json({ error: "exercicesTypes must be an array" });
            return;
        }

        const validMuscles = Object.values(Muscle);
        const invalidMuscles = req.body.targetedMuscles.filter((muscle: Muscle) => !validMuscles.includes(muscle));

        if (invalidMuscles.length > 0) {
            res.status(400).json({
                error: "Invalid muscles",
                invalidMuscles,
                validMuscles
            });
            return;
        }

        try {
            const equipment = await this.equipmentService.createEquipment(req.body as Equipment);
            res.status(201).json(equipment);
        } catch (error) {
            console.error('Error creating equipment:', error);
            res.status(500).json({ error: "Failed to create equipment" });
        }
    }

    async getAllEquipments(req: Request, res: Response) {
        try {
            const equipments = await this.equipmentService.getAllEquipments();
            res.status(200).json(equipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch equipments" });
        }
    }

    async getEquipmentById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const equipment = await this.equipmentService.findEquipmentById(id);

            if (!equipment) {
                res.status(404).json({ error: "Equipment not found" });
                return;
            }

            res.status(200).json(equipment);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch equipment" });
        }
    }

    async updateEquipment(req: Request, res: Response) {
        const { id } = req.params;

        if (!req.body || (!req.body.name && !req.body.description && !req.body.targetedMuscles && !req.body.exercicesTypes)) {
            res.status(400).json({ error: "At least one field (name, description, targetedMuscles, exercicesTypes) is required" });
            return;
        }

        // Validation des muscles si fournis
        if (req.body.targetedMuscles) {
            if (!Array.isArray(req.body.targetedMuscles)) {
                res.status(400).json({ error: "targetedMuscles must be an array" });
                return;
            }

            const validMuscles = Object.values(Muscle);
            const invalidMuscles = req.body.targetedMuscles.filter((muscle: Muscle) => !validMuscles.includes(muscle));

            if (invalidMuscles.length > 0) {
                res.status(400).json({
                    error: "Invalid muscles",
                    invalidMuscles,
                    validMuscles
                });
                return;
            }
        }

        // Validation des exercicesTypes si fournis
        if (req.body.exercicesTypes && !Array.isArray(req.body.exercicesTypes)) {
            res.status(400).json({ error: "exercicesTypes must be an array" });
            return;
        }

        try {
            const updatedEquipment = await this.equipmentService.updateEquipment(id, req.body);

            if (!updatedEquipment) {
                res.status(404).json({ error: "Equipment not found" });
                return;
            }

            res.status(200).json(updatedEquipment);
        } catch (error) {
            res.status(500).json({ error: "Failed to update equipment" });
        }
    }

    async deleteEquipment(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const deleted = await this.equipmentService.deleteEquipment(id);

            if (!deleted) {
                res.status(404).json({ error: "Equipment not found" });
                return;
            }

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete equipment" });
        }
    }

    async getEquipmentsByMuscle(req: Request, res: Response) {
        const { muscle } = req.params;

        if (!Object.values(Muscle).includes(muscle as Muscle)) {
            res.status(400).json({
                error: "Invalid muscle",
                validMuscles: Object.values(Muscle)
            });
            return;
        }

        try {
            const equipments = await this.equipmentService.findEquipmentsByMuscle(muscle);
            res.status(200).json(equipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch equipments by muscle" });
        }
    }

    async getEquipmentsByExerciseType(req: Request, res: Response) {
        const { exerciseTypeId } = req.params;

        try {
            const equipments = await this.equipmentService.getEquipmentsByExerciseType(exerciseTypeId);
            res.status(200).json(equipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch equipments by exercise type" });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get('/', this.getAllEquipments.bind(this));
        router.get('/:id', this.getEquipmentById.bind(this));
        router.get('/muscle/:muscle', this.getEquipmentsByMuscle.bind(this));
        router.get('/exercise-type/:exerciseTypeId', this.getEquipmentsByExerciseType.bind(this));

        router.post(
            '/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.createEquipment.bind(this)
        );

        router.put(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateEquipment.bind(this)
        );

        router.delete(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteEquipment.bind(this)
        );

        return router;
    }
}
