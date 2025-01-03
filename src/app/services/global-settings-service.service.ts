import { Injectable, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GlobalSettingsFormValues } from '../interfaces/mainData/global-settings-form-values';
import { Item } from '../interfaces/mainData/Item';

@Injectable({
  providedIn: 'root',
})
export class GlobalSettingsServiceService {
  public globalSettingsSignal: WritableSignal<GlobalSettingsFormValues> = signal({
    initialAmountValue: 60,
    unitSelected: 'm',
    assemblerSelect: {} as Item,
    smeltingSelect: {} as Item,
    miningSelect: {} as Item,
    researchSelect: {} as Item,
    chemicalSelect: {} as Item,
    refiningSelect: {} as Item,
    oilSelect: {} as Item,
    proliferationSelect: {} as Item,
  });

  updateProperty<T extends keyof GlobalSettingsFormValues>(key: T, value: GlobalSettingsFormValues[T]): void {
    const currentValues = this.globalSettingsSignal();
    this.globalSettingsSignal.set({ ...currentValues, [key]: value });
  }

  getFormValues(): GlobalSettingsFormValues {
    return this.globalSettingsSignal();
  }

  getProperty<T extends keyof GlobalSettingsFormValues>(key: T): GlobalSettingsFormValues[T] {
    console.log(key);
    console.log(this.globalSettingsSignal()[key]);
    return this.globalSettingsSignal()[key];
  }

  setPropertyWithLocalStorage(
    propertyName: keyof GlobalSettingsFormValues,
    options: Item[],
    localStorageKey: string
  ): void {
    const savedID = localStorage.getItem(localStorageKey);

    let selectedItem: Item;

    if (savedID) {
      selectedItem = options.find((item) => item.ID === parseInt(savedID, 10)) || options[0];
    } else {
      selectedItem = options[0];
    }
    console.log(selectedItem);
    this.updateProperty(propertyName, selectedItem);
  }
  checkValidKey(key: string): keyof GlobalSettingsFormValues | null {
    const validKeys: (keyof GlobalSettingsFormValues)[] = [
      'assemblerSelect',
      'miningSelect',
      'smeltingSelect',
      'researchSelect',
      'chemicalSelect',
      'refiningSelect',
      'oilSelect',
      'proliferationSelect',
    ];

    return validKeys.includes(key as keyof GlobalSettingsFormValues) ? (key as keyof GlobalSettingsFormValues) : null;
  }
}
