import { Item } from './Item';

export interface GlobalSettingsFormValues {
  initialAmountValue: number;
  unitSelected: 'm' | 's';
  assemblerSelect: Item;
  smeltingSelect: Item;
  miningSelect: Item;
  researchSelect: Item;
  chemicalSelect: Item;
  refiningSelect: Item;
  oilSelect: Item;
  proliferationSelect: Item;
  beltSelect: Item;
}
