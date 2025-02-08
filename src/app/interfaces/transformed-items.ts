export interface TransformedItems {
  ID: number;
  name: string;
  Type: string;
  IconPath: string;
  GridIndex: number;
  recipes: recipes[];
  typeString: string;
  fuelTypeString: string;
  childs: TransformedItems[];
  madeFromString: string;
  TimeSpend: number;
  Items: number[];
  ItemCounts: number[];
  Results: number[];
  ResultCounts: number[];
  totalValue: number;
  totalMachine: number;
  power: number;
  beltsNeeded: number;
  selectedRecipe: recipes;
  nodeUUID: string;
}

export interface recipes {
  ID: number;
  name: string;
}
