import { Item } from "./Item";

export interface GlobalSettingsFormValues {
    initialAmountValue: number;
    unitSelected: string;
    assemblerSelect: Item;
    smeltingSelect: Item;
    miningSelect: Item;
    researchSelect: Item;
    chemicalSelect: Item;
    refiningSelect: Item;
    oilSelect: Item;
}
