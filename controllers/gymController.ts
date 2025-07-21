import {json, Request, Response, Router} from "express";
import {GymService, SessionService} from "../services";
import {Gym, UserRole} from "../models";
import {Difficulty} from "../utils/enums/difficulty";
import {roleMiddleware, sessionMiddleware} from "../middlewares";

export class GymController {
    constructor(
        public readonly gymService: GymService,
        public readonly sessionService: SessionService
    ) {
    }

    async createGym(req: Request, res: Response) {
        if (!req.body || !req.body.name || !req.body.capacity || !req.body.address || !req.body.contact || !req.body.manager || !req.body.exerciseTypes || !req.body.descriptionEquipments || !req.body.descriptionExerciseTypes) {
            res.status(400).json({error: "Missing required fields: name, capacity, address, contact, manager, exerciseTypes, descriptionEquipments, descriptionExerciseTypes"});
            return;
        }

        if (!Array.isArray(req.body.exerciseTypes)) {
            res.status(400).json({error: "exerciseTypes must be an array"});
            return;
        }

        if (req.body.difficulty && !Object.values(Difficulty).includes(req.body.difficulty)) {
            res.status(400).json({
                error: "Invalid difficulty",
                validDifficulties: Object.values(Difficulty)
            });
            return;
        }

        try {
            const gym = await this.gymService.createGym(req.body as Gym);
            res.status(201).json(gym);
        } catch (error) {
            console.error('Error creating gym:', error);
            res.status(500).json({error: "Failed to create gym"});
        }
    }

    async getAllGyms(req: Request, res: Response) {
        try {
            const gyms = await this.gymService.getAllGyms();
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch gyms"});
        }
    }

    async getGymById(req: Request, res: Response) {
        const {id} = req.params;

        try {
            const gym = await this.gymService.findGymById(id);

            if (!gym) {
                res.status(404).json({error: "Gym not found"});
                return;
            }

            res.status(200).json(gym);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch gym"});
        }
    }

    async updateGym(req: Request, res: Response) {
        const {id} = req.params;

        if (!req.body || (!req.body.name && !req.body.address && !req.body.contact && !req.body.difficulty && !req.body.exerciseTypes && !req.body.descriptionEquipments && !req.body.descriptionExerciseTypes && !req.body.isApproved)) {
            res.status(400).json({error: "At least one field is required"});
            return;
        }

        if (req.body.difficulty && !Object.values(Difficulty).includes(req.body.difficulty)) {
            res.status(400).json({
                error: "Invalid difficulty",
                validDifficulties: Object.values(Difficulty)
            });
            return;
        }

        if (req.body.exerciseTypes && !Array.isArray(req.body.exerciseTypes)) {
            res.status(400).json({error: "exerciseTypes must be an array"});
            return;
        }

        try {
            const updatedGym = await this.gymService.updateGym(id, req.body);

            if (!updatedGym) {
                res.status(404).json({error: "Gym not found"});
                return;
            }

            res.status(200).json(updatedGym);
        } catch (error) {
            res.status(500).json({error: "Failed to update gym"});
        }
    }

    async deleteGym(req: Request, res: Response) {
        const {id} = req.params;

        try {
            const deleted = await this.gymService.deleteGym(id);

            if (!deleted) {
                res.status(404).json({error: "Gym not found"});
                return;
            }

            res.status(204).end();
        } catch (error) {
            res.status(500).json({error: "Failed to delete gym"});
        }
    }

    async getGymsByDifficulty(req: Request, res: Response) {
        const {difficulty} = req.params;

        if (!Object.values(Difficulty).includes(difficulty as Difficulty)) {
            res.status(400).json({
                error: "Invalid difficulty",
                validDifficulties: Object.values(Difficulty)
            });
            return;
        }

        try {
            const gyms = await this.gymService.findGymsByDifficulty(difficulty as Difficulty);
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch gyms by difficulty"});
        }
    }

    async getGymsByManager(req: Request, res: Response) {
        const {managerId} = req.params;

        try {
            const gyms = await this.gymService.findGymsByManager(managerId);
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch gyms by manager"});
        }
    }

    async getApprovedGyms(req: Request, res: Response) {
        try {
            const gyms = await this.gymService.findApprovedGyms();
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch approved gyms"});
        }
    }

    async getPendingGyms(req: Request, res: Response) {
        try {
            const gyms = await this.gymService.findPendingGyms();
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch pending gyms"});
        }
    }

    async approveGym(req: Request, res: Response) {
        const {id} = req.params;

        try {
            const approvedGym = await this.gymService.approveGym(id);

            if (!approvedGym) {
                res.status(404).json({error: "Gym not found"});
                return;
            }

            res.status(200).json(approvedGym);
        } catch (error) {
            res.status(500).json({error: "Failed to approve gym"});
        }
    }

    async rejectGym(req: Request, res: Response) {
        const {id} = req.params;

        try {
            const rejectedGym = await this.gymService.rejectGym(id);

            if (!rejectedGym) {
                res.status(404).json({error: "Gym not found"});
                return;
            }

            res.status(200).json(rejectedGym);
        } catch (error) {
            res.status(500).json({error: "Failed to reject gym"});
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get('/', this.getAllGyms.bind(this));
        router.get('/approved', this.getApprovedGyms.bind(this));
        router.get('/pending', this.getPendingGyms.bind(this));
        router.get('/difficulty/:difficulty', this.getGymsByDifficulty.bind(this));
        router.get('/manager/:managerId', this.getGymsByManager.bind(this));
        router.get('/:id', this.getGymById.bind(this));

        router.post(
            '/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.createGym.bind(this)
        );

        router.put(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateGym.bind(this)
        );

        router.delete(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteGym.bind(this)
        );

        router.put(
            '/:id/approve',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.approveGym.bind(this)
        );

        router.put(
            '/:id/reject',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.rejectGym.bind(this)
        );

        return router;
    }
}
