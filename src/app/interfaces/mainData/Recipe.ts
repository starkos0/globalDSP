export interface Recipe {
  ID: number;
  Type: string;
  name: string;
  index: number;
  description: string;
  madeFromString: string;
  productive: boolean;
  NonProductive: boolean;
  Handcraft: boolean;
  Explicit: boolean;
  hasIcon: boolean;
  TimeSpend: number;
  GridIndex: number;
  IconPath: string;
  Items: number[];
  ItemCounts: number[];
  Results: number[];
  ResultCounts: number[];
}
