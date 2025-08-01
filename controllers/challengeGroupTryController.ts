import { json, Request, Response, Router } from "express";
import {
  ChallengeGroupTryService,
  SessionService,
  UserBadgeService,
  UserService,
} from "../services";
import { UserRole, User } from "../models";
import { roleMiddleware, sessionMiddleware } from "../middlewares";

export class ChallengeGroupTryController {
  constructor(
    public readonly challengeGroupTryService: ChallengeGroupTryService,
    public readonly sessionService: SessionService,
    public readonly userService: UserService,
    public readonly userBadgeService: UserBadgeService,
  ) {}

  async createGroup(req: Request, res: Response) {
    if (!req.body || !req.body.name || !req.body.users || !req.body.challenge) {
      res.status(400).json({
        error: "Missing required fields: name, users, challenge",
      });
      return;
    }

    if (!Array.isArray(req.body.users)) {
      res.status(400).json({ error: "users must be an array" });
      return;
    }

    if (req.body.users.length === 0) {
      res.status(400).json({ error: "At least one user is required" });
      return;
    }

    const myUser = req.user;

    if (!myUser) {
      res
        .status(401)
        .json({ error: "Can not create ressource, user not provided" });

      return;
    }

    try {
      const users: User[] = [];
      users.push(myUser);
      for (const userId of req.body.users) {
        const user = await this.userService.model.findById(userId);
        if (!user) {
          res.status(400).json({ error: `User with id ${userId} not found` });
          return;
        }
        users.push(user);
      }

      const groupData = {
        name: req.body.name,
        challenge: req.body.challenge,
        users: users,
        creator: users[0],
      };

      const group = await this.challengeGroupTryService.createGroup(groupData);
      if (group) {
        await this.userService.model.updateMany(
          { _id: { $in: users.map((user) => user._id) } },
          { $push: { groups: group._id } }
        );
      }
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ error: "Failed to create group" });
    }

    this.userBadgeService.updateUserBadges(myUser._id);
  }

  async getAllGroups(req: Request, res: Response) {
    try {
      const groups = await this.challengeGroupTryService.getAllGroups();
      res.status(501).json({ error: "Not implemented yet" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  }

  async getGroupById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      res
        .status(401)
        .json({ error: "Can not create ressource, user not provided" });

      return;
    }

    try {
      const group = await this.challengeGroupTryService.findGroupById(user, id);

      if (!group) {
        res.status(404).json({ error: "Group not found" });
        return;
      }

      res.status(200).json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group" });
    }
  }

  async getGroupsByUser(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      res
        .status(401)
        .json({ error: "Can not create ressource, user not provided" });

      return;
    }

    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    try {
      const groups = await this.challengeGroupTryService.findGroupsByUser(
        user._id,
        limit,
        offset
      );
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups by user" });
    }
  }

  async updateGroup(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;

    if (!req.body || (!req.body.name && !req.body.users)) {
      res
        .status(400)
        .json({ error: "At least one field is required (name, users)" });
      return;
    }

    try {
      const thisGroup = await this.challengeGroupTryService.findGroupById(
        user,
        id
      );

      if (!thisGroup) {
        res.status(404).json({ error: "Group not found" });
        return;
      }

      if (req.body.users && Array.isArray(req.body.users)) {
        const creatorId = thisGroup.creator._id.toString();
        const userIds = req.body.users.map((userId: string) =>
          userId.toString()
        );

        if (!userIds.includes(creatorId)) {
          req.body.users.push(creatorId);
        }
      }

      const updatedGroup = await this.challengeGroupTryService.updateGroup(
        id,
        user,
        req.body
      );

      if (!updatedGroup) {
        res.status(404).json({ error: "Group not found or permission denied" });
        return;
      }

      const originalUserIds = thisGroup.users.map((user) =>
        user._id.toString()
      );
      const updatedUserIds = updatedGroup.users.map((user) =>
        user._id.toString()
      );

      const removedUserIds = originalUserIds.filter(
        (userId) => !updatedUserIds.includes(userId)
      );

      const addedUserIds = updatedUserIds.filter(
        (userId) => !originalUserIds.includes(userId)
      );

      if (removedUserIds.length > 0) {
        await this.userService.model.updateMany(
          { _id: { $in: removedUserIds } },
          { $pull: { groups: id } }
        );
      }

      if (addedUserIds.length > 0) {
        await this.userService.model.updateMany(
          { _id: { $in: addedUserIds } },
          { $push: { groups: id } }
        );
      }

      res.status(200).json(updatedGroup);
    } catch (error) {
      res.status(500).json({ error: "Failed to update group" });
    }

    this.userBadgeService.updateUserBadges(user._id);
  }

  async removeUserFromGroup(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      res
        .status(401)
        .json({ error: "Can not create ressource, user not provided" });

      return;
    }

    try {
      await this.challengeGroupTryService.userExitGroup(user._id, id);
      await this.userService.model.updateOne(
        { _id: user._id },
        { $pull: { groups: id } }
      );
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove user from group" });
    }
  }

  async deleteGroup(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;

    try {
      const groupToDelete = await this.challengeGroupTryService.findGroupById(
        user,
        id
      );

      if (!groupToDelete) {
        res.status(404).json({ error: "Group not found" });
        return;
      }

      await this.challengeGroupTryService.deleteGroup(id, user);

      const userIds = groupToDelete.users.map((user) => user._id);
      await this.userService.model.updateMany(
        { _id: { $in: userIds } },
        { $pull: { groups: id } }
      );

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group" });
    }
  }

  buildRouter(): Router {
    const router = Router();

    // Routes GET
    router.get(
      "/",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.getAllGroups.bind(this)
    );

    router.get(
      "/me",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.USER),
      this.getGroupsByUser.bind(this)
    );

    router.get(
      "/:id",
      sessionMiddleware(this.sessionService),
      this.getGroupById.bind(this)
    );

    // Routes POST
    router.post(
      "/",
      json(),
      sessionMiddleware(this.sessionService),
      this.createGroup.bind(this)
    );

    // Routes PUT
    router.put(
      "/:id",
      json(),
      sessionMiddleware(this.sessionService),
      this.updateGroup.bind(this)
    );

    // Routes PATCH
    router.patch(
      "/:id",
      json(),
      sessionMiddleware(this.sessionService),
      this.removeUserFromGroup.bind(this)
    );

    // Routes DELETE
    router.delete(
      "/:id",
      sessionMiddleware(this.sessionService),
      this.deleteGroup.bind(this)
    );

    return router;
  }
}
