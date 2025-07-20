import { Timestamps } from "./timestamps";
import { Gym } from "./gym";
import { Equipment } from "./equipment";

export interface GymEquipment extends Timestamps {
    _id: string;
    gymId: string | Gym;
    equipmentId: string | Equipment;
    quantity: number;
} 
