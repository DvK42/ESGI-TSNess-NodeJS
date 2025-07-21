import { Request, Response, Router, json } from "express";
import { GymEquipmentService, SessionService } from "../services";
import { UserRole } from "../models";
import { roleMiddleware, sessionMiddleware } from "../middlewares";

export class GymEquipmentController {
    constructor(
        public readonly gymEquipmentService: GymEquipmentService,
        public readonly sessionService: SessionService
    ) { }

    async addEquipmentToGym(req: Request, res: Response) {
        const { gymId, equipmentId, quantity = 1 } = req.body;

        if (!gymId || !equipmentId) {
            res.status(400).json({ error: "Missing required fields: gymId and equipmentId" });
            return;
        }

        if (!quantity || quantity < 1) {
            res.status(400).json({ error: "Quantity must be at least 1" });
            return;
        }

        try {
            const gymEquipment = await this.gymEquipmentService.addEquipmentToGym(gymId, equipmentId, quantity);
            res.status(201).json(gymEquipment);
        } catch (error) {
            console.error('Error adding equipment to gym:', error);
            res.status(500).json({ error: "Failed to add equipment to gym" });
        }
    }

    async getGymEquipments(req: Request, res: Response) {
        const { gymId } = req.params;

        try {
            const gymEquipments = await this.gymEquipmentService.getGymEquipments(gymId);
            res.status(200).json(gymEquipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch gym equipments" });
        }
    }

    async getGymsWithEquipment(req: Request, res: Response) {
        const { equipmentId } = req.params;

        try {
            const gymEquipments = await this.gymEquipmentService.getGymsWithEquipment(equipmentId);
            res.status(200).json(gymEquipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch gyms with equipment" });
        }
    }

    async updateEquipmentQuantity(req: Request, res: Response) {
        const { gymId, equipmentId, quantity } = req.body;

        if (!gymId || !equipmentId) {
            res.status(400).json({ error: "Missing required fields: gymId and equipmentId" });
            return;
        }

        if (!quantity || quantity < 1) {
            res.status(400).json({ error: "Quantity must be at least 1" });
            return;
        }

        try {
            const updatedGymEquipment = await this.gymEquipmentService.updateEquipmentQuantity(gymId, equipmentId, quantity);

            if (!updatedGymEquipment) {
                res.status(404).json({ error: "Gym equipment relation not found" });
                return;
            }

            res.status(200).json(updatedGymEquipment);
        } catch (error) {
            res.status(500).json({ error: "Failed to update equipment quantity" });
        }
    }

    async removeEquipmentFromGym(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const gymEquipment = await this.gymEquipmentService.findGymEquipmentById(id);

            if (!gymEquipment) {
                res.status(404).json({ error: "Gym equipment relation not found" });
                return;
            }

            const removed = await this.gymEquipmentService.removeEquipmentFromGym(gymEquipment.gymId as string, gymEquipment.equipmentId as string);

            if (!removed) {
                res.status(404).json({ error: "Failed to remove equipment from gym" });
                return;
            }

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to remove equipment from gym" });
        }
    }

    async getAllGymEquipments(req: Request, res: Response) {
        try {
            const gymEquipments = await this.gymEquipmentService.getAllGymEquipments();
            res.status(200).json(gymEquipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch all gym equipments" });
        }
    }

    async getEquipmentsByGymId(req: Request, res: Response) {
        const { gymId } = req.params;

        try {
            const equipments = await this.gymEquipmentService.getEquipmentsByGymId(gymId);
            res.status(200).json(equipments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch equipments by gym" });
        }
    }

    async getGymsByEquipmentId(req: Request, res: Response) {
        const { equipmentId } = req.params;

        try {
            const gyms = await this.gymEquipmentService.getGymsByEquipmentId(equipmentId);
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch gyms by equipment" });
        }
    }

    async getGymEquipmentById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const gymEquipment = await this.gymEquipmentService.findGymEquipmentById(id);

            if (!gymEquipment) {
                res.status(404).json({ error: "Gym equipment relation not found" });
                return;
            }

            res.status(200).json(gymEquipment);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch gym equipment" });
        }
    }

    async removeAllEquipmentsFromGym(req: Request, res: Response) {
        const { gymId } = req.params;

        try {
            const removed = await this.gymEquipmentService.removeAllEquipmentsFromGym(gymId);

            if (!removed) {
                res.status(404).json({ error: "Gym not found or no equipments to remove" });
                return;
            }

            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "Failed to remove all equipments from gym" });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get('/', this.getAllGymEquipments.bind(this));
        router.get('/gym/:gymId', this.getGymEquipments.bind(this));
        router.get('/equipment/:equipmentId', this.getGymsWithEquipment.bind(this));
        router.get('/gym/:gymId/equipments', this.getEquipmentsByGymId.bind(this));
        router.get('/equipment/:equipmentId/gyms', this.getGymsByEquipmentId.bind(this));
        router.get('/:id', this.getGymEquipmentById.bind(this));

        router.post(
            '/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.addEquipmentToGym.bind(this)
        );

        router.put(
            '/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateEquipmentQuantity.bind(this)
        );

        router.delete(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.removeEquipmentFromGym.bind(this)
        );

        router.delete(
            '/gym/:gymId/equipments',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.removeAllEquipmentsFromGym.bind(this)
        );

        return router;
    }
} 
