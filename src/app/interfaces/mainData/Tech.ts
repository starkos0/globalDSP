export interface Tech {
  ID: number;
  name: string;
  page: number;
  description: string;
  conclusion: string;
  nameAndLevel: string;
  nameAndMaxLevel: string;
  IconPath: string;
  Published: boolean;
  IsHiddenTech: boolean;
  Level: number;
  MaxLevel: number;
  LevelCoef1: number;
  LevelCoef2: number;
  IsLabTech: boolean;
  HashNeeded: number;
  Position: Position;
  PreItem: number[];
  PreTechs: number[];
  PreTechsImplicit: number[];
  PreTechsMax: boolean;
  Items: number[];
  ItemPoints: number[];
  PropertyOverrideItems: number[];
  PropertyItemCounts: number[];
  UnlockRecipes: number[];
  UnlockFunctions: number[];
  UnlockValues: number[];
  AddItems: number[];
  AddItemCounts: number[];
  preTechArray: preTechArray[];
  postTechArray: PostTechArray[];
  unlockRecipeArray: unlockRecipeArray[];
  itemArray: itemArray[];
  unlockNeedItemArray: UnlockNeedItem[];
}
export interface UnlockNeedItem {
  id: number;
  count: number;
}
export interface Position {
  x: number;
  y: number;
}

export interface PostTechArray {
  ID: number;
}
export interface itemArray {
  ID: number;
}
export interface unlockRecipeArray {
  ID: number;
}
export interface preTechArray {
  ID: number;
}
