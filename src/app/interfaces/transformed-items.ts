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
}

export interface recipes{
    ID: number;
    name: string;
}