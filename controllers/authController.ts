import {json, Request, Response, Router} from "express";

import {SessionService, UserService} from "../services";
import {sessionMiddleware} from "../middlewares";
import {UserRole} from "../models";

export class AuthController {
    constructor(
        public readonly userService: UserService,
        public readonly sessionService: SessionService) {
    }

    async login(req: Request, res: Response) {
        if (!req.body || !req.body.email || !req.body.password) {
            res.status(400).end();

            return;
        }

        const user = await this.userService.findUser(req.body.email, req.body.password);

        if (!user) {
            res.status(401).end();

            return;
        }

        const session = await this.sessionService.createSession({
            user: user,
            // 15 days
            expirationDate: new Date(Date.now() + 1_296_000_000)
        });

        res.status(201).json(session);
    }

    async me(req: Request, res: Response) {
        res.json(req.user);
    }

    async register(req: Request, res: Response) {
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
                lastName: req.body.lastName,
                firstName: req.body.firstName,
                email: req.body.email,
                role: UserRole.USER,
                password: req.body.password,
                score: 0
            });

            res.status(201).json(user);
        } catch {
            res.status(409).end();
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.post('/login', json(), this.login.bind(this));
        router.post('/register', json(), this.register.bind(this));
        router.get('/me', sessionMiddleware(this.sessionService), this.me.bind(this));

        return router;
    }
}
