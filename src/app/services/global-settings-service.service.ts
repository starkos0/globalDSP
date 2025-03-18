import { Injectable, Injector, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GlobalSettingsFormValues } from '../interfaces/mainData/global-settings-form-values';
import { Item } from '../interfaces/mainData/Item';
import { DataManagementService } from './data-management.service';

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
    beltSelect: {} as Item,
  });

  constructor(private injector: Injector){}

  updateProperty<T extends keyof GlobalSettingsFormValues>(key: T, value: GlobalSettingsFormValues[T]): void {
    const currentValues = this.globalSettingsSignal();
    this.globalSettingsSignal.set({ ...currentValues, [key]: value });

    if(key === 'initialAmountValue'){
      if (!this.dataManagement) {
        this.initialize(); // Asegura que dataManagement esté inicializado
      }
      
      console.log(this.dataManagement.selectedItems()[0])
      this.dataManagement.changeItemTotalValue(this.dataManagement.selectedItems()[0],currentValues.initialAmountValue)
    }
  }
  private dataManagement!: DataManagementService
  initialize(){
    this.dataManagement = this.injector.get(DataManagementService);
  }
  getFormValues(): GlobalSettingsFormValues {
    return this.globalSettingsSignal();
  }

  getProperty<T extends keyof GlobalSettingsFormValues>(key: T): GlobalSettingsFormValues[T] {
    return this.globalSettingsSignal()[key];
  }

  setPropertyWithLocalStorage(propertyName: keyof GlobalSettingsFormValues, options: Item[], localStorageKey: string): void {
    const savedID = localStorage.getItem(localStorageKey);

    let selectedItem: Item;

    if (savedID) {
      selectedItem = options.find((item) => item.ID === parseInt(savedID, 10)) || options[0];
    } else {
      selectedItem = options[0];
    }
    if (selectedItem.name.toLowerCase().includes("smelter") || selectedItem.name.toLowerCase().includes("assembler")) {
      console.log(selectedItem.name + " speed: " + (selectedItem.prefabDesc.assemblerSpeed / 10000))
    }
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
      'beltSelect',
    ];

    return validKeys.includes(key as keyof GlobalSettingsFormValues) ? (key as keyof GlobalSettingsFormValues) : null;
  }

  getMachineSpeed(machineType: keyof GlobalSettingsFormValues | null): number {
    if (!machineType) return -1;

    const property = this.getProperty(machineType);

    let machineSpeed = -1;

    if (typeof property !== 'object' || property === null || !('prefabDesc' in property)) {
      return -1
    }
    
    if (machineType === 'miningSelect') {
      machineSpeed = property.prefabDesc?.minerPeriod;
    } else if (machineType === 'researchSelect') {
      machineSpeed = property.prefabDesc.labAssembleSpeed;
    } else {
      machineSpeed = property.prefabDesc?.assemblerSpeed;
    }
    return machineSpeed;
  }
}
