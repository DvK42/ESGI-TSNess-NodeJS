import { json, Request, Response, Router } from "express";

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
        if (
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

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            await this.userService.deleteUser(id);
            res.status(204).end();
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(404).json({ error: "User not found" });
        }
    }

    async toggleUserActivation(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            await this.userService.toggleUserActivation(id);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ error: "User not found" });
        }
    }

    async updateRole(req: Request, res: Response) {
        if (!req.body || !req.body.role) {
            res.status(400).json({ error: "Role is required" });
            return;
        }

        if (!Object.values(UserRole).includes(req.body.role)) {
            res.status(400).json({ error: "Invalid role, valid roles are: " + Object.values(UserRole).join(", ") });
            return;
        }

        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            await this.userService.updateRole(id, req.body.role);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ error: "User not found" });
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

        router.put(
            '/:id/toggle-activation',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.toggleUserActivation.bind(this)
        );

        router.put(
            '/:id/update-role',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateRole.bind(this)
        );

        router.delete(
            '/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteUser.bind(this)
        );

        return router;
    }
}
