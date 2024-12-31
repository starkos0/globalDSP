import { TotalItems } from "./TotalItems";

export interface Totals {
    totalPower: number;
    totalMachinesByType: { name: string; total: number }[];
    totalItems: TotalItems[];
}
