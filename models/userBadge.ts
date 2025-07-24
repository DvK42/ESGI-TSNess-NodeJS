import { Badge } from "./badge";
import { Timestamps } from "./timestamps";
import { User } from "./user";

export interface UserBadge extends Timestamps {
  _id: string;
  user: User | string;
  badge: Badge | string;
}

