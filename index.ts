import express from "express";

import { openConnection } from "./mongoose";
import { UserRole } from "./models";
import {
    AuthController,
    ExerciseTypeController,
    UserController,
    EquipmentController,
    GymController,
    GymEquipmentController,
    ExerciseController,
    TrainingController
} from "./controllers";
import {
    UserService,
    SessionService,
    EquipmentService,
    ExerciseTypeService,
    GymService,
    GymEquipmentService,
    ExerciseService,
    TrainingService
} from "./services";
import { FIRST_ACCOUNT_EMAIL, FIRST_ACCOUNT_PASSWORD } from "./utils/tools";

const startServer = async () => {
    const app = express();
    const connection = await openConnection();

    const userService = new UserService(connection);
    const sessionService = new SessionService(connection);
    const exerciseTypeService = new ExerciseTypeService(connection);
    const equipmentService = new EquipmentService(connection);
    const gymService = new GymService(connection);
    const gymEquipmentService = new GymEquipmentService(connection);
    const exerciseService = new ExerciseService(connection);
    const trainingService = new TrainingService(connection);

    const authController = new AuthController(userService, sessionService);
    const userController = new UserController(userService, sessionService);
    const exerciseTypeController = new ExerciseTypeController(exerciseTypeService, sessionService);
    const equipmentController = new EquipmentController(equipmentService, sessionService);
    const gymController = new GymController(gymService, sessionService);
    const gymEquipmentController = new GymEquipmentController(gymEquipmentService, sessionService);
    const exerciseController = new ExerciseController(exerciseService, sessionService);
    const trainingController = new TrainingController(trainingService, sessionService);

    await bootstrap(userService);

    app.use('/api', authController.buildRouter());
    app.use('/api/users', userController.buildRouter());
    app.use('/api/exercise-types', exerciseTypeController.buildRouter());
    app.use('/api/equipments', equipmentController.buildRouter());
    app.use('/api/gyms', gymController.buildRouter());
    app.use('/api/gym-equipments', gymEquipmentController.buildRouter());
    app.use('/api/exercises', exerciseController.buildRouter());
    app.use('/api/trainings', trainingController.buildRouter());

    app.listen(3000, () => console.log(`Listening on port 3000`));
}

const bootstrap = async (userService: UserService) => {
    if (FIRST_ACCOUNT_EMAIL === undefined) {
        throw new Error('FIRST_ACCOUNT_EMAIL is not defined');
    }

    if (FIRST_ACCOUNT_PASSWORD === undefined) {
        throw new Error('FIRST_ACCOUNT_PASSWORD is not defined');
    }

    const rootUser = await userService.findUser(FIRST_ACCOUNT_EMAIL);
    if (!rootUser) {
        // ✅ Importer le seeder APRÈS la connexion
        // await import('./seeders/users');
        await userService.createUser({
            firstName: 'Admin',
            lastName: 'Platform',
            password: FIRST_ACCOUNT_PASSWORD,
            email: FIRST_ACCOUNT_EMAIL,
            role: UserRole.ADMIN
        });
    }
}

startServer().catch(console.error);
