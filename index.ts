import express from "express";

import { openConnection } from "./mongoose";
import { UserRole } from "./models";
import { AuthController, UserController} from "./controllers";
import { UserService, SessionService } from "./services";
import { FIRST_ACCOUNT_EMAIL, FIRST_ACCOUNT_PASSWORD } from "./utils/tools";

const startServer = async () => {
  const app = express();
  const connection = await openConnection();

  const userService = new UserService(connection);
  const sessionService = new SessionService(connection);
  
  const authController = new AuthController(userService, sessionService);
  const userController = new UserController(userService, sessionService);

  await bootstrap(userService);

  app.use('/api', authController.buildRouter());
  app.use('api/users', userController.buildRouter());

  app.listen(3000, () => console.log(`Listening on port 3000`));
}

const bootstrap = async (userService: UserService) => {
  if(FIRST_ACCOUNT_EMAIL === undefined) {
    throw new Error('FIRST_ACCOUNT_EMAIL is not defined');
  }

  if(FIRST_ACCOUNT_PASSWORD === undefined) {
    throw new Error('FIRST_ACCOUNT_PASSWORD is not defined');
  }

  const rootUser = await userService.findUser(FIRST_ACCOUNT_EMAIL);
  if(!rootUser) {
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
