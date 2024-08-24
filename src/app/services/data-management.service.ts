import { Injectable, signal, WritableSignal } from '@angular/core';
import Dexie, { liveQuery, Table } from 'dexie';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { AppDB } from './db';
import { Tech } from '../interfaces/mainData/Tech';
import { Recipe } from '../interfaces/mainData/Recipe';
import { Item } from '../interfaces/mainData/Item';
import { FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class DataManagementService {
  private _globalSettingsForm!: FormGroup;

  setGlobalSettingsForm(form: FormGroup) {
    this._globalSettingsForm = form;
  }

  get globalSettingsForm(): FormGroup {
    return this._globalSettingsForm;
  }

  //to get changes 
  private typesSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public types$: Observable<string[]> = this.typesSubject.asObservable();

  private facilityTypes: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public facilityTypes$: Observable<string[]> = this.facilityTypes.asObservable();

  public machinesSpeedRatio: number = 10000;
  public defaultItem: Item = {
    Type: '',
    StackSize: 0,
    Grade: 0,
    Upgrades: [],
    IsEntity: false,
    CanBuild: false,
    IconPath: '',
    ModelIndex: 0,
    ModelCount: 0,
    HpMax: 0,
    BuildIndex: 0,
    BuildMode: 0,
    GridIndex: 0,
    DescFields: [],
    handcraft: {
      ID: 0,
      name: ''
    },
    maincraft: {
      ID: 0,
      name: ''
    },
    handcraftProductCount: 0,
    maincraftProductCount: 0,
    handcrafts: [],
    recipes: [],
    makes: [],
    rawMats: [],
    preTech: {
      ID: 0,
      name: ''
    },
    prefabDesc: {
      modelIndex: 0,
      hasObject: false,
      lodCount: 0,
      lodDistances: [],
      startInstCapacity: 0,
      batchCapacity: 0,
      cullingHeight: 0,
      castShadow: 0,
      recvShadow: 0,
      colliders: [],
      hasBuildCollider: false,
      buildCollider: {
        idType: 0,
        pos: {
          y: 0
        },
        ext: {},
        q: {
          w: 0
        },
        shape: ''
      },
      buildColliders: [],
      roughRadius: 0,
      roughHeight: 0,
      roughWidth: 0,
      colliderComplexity: 0,
      barWidth: 0,
      barHeight: 0,
      landPoints: [],
      dragBuild: false,
      dragBuildDist: {
        x: 0,
        y: 0
      },
      blueprintBoxSize: {
        x: 0,
        y: 0
      },
      isAssembler: false,
      assemblerSpeed: 0,
      assemblerRecipeType: '',
      anim_working_length: 0,
      isPowerConsumer: false,
      workEnergyPerTick: 0,
      idleEnergyPerTick: 0,
      minimapType: 0,
      slotPoses: [],
      selectCenter: {
        y: 0
      },
      selectSize: {},
      selectAlpha: 0,
      selectDistance: 0,
      signHeight: 0,
      signSize: 0,
      audioProtoId0: 0,
      audioRadius0: 0,
      audioRadius1: 0,
      audioFalloff: 0,
      audioVolume: 0,
      audioPitch: 0,
      audioDoppler: 0
    },
    ID: 0,
    description: '',
    index: 0,
    iconSprite: '',
    canUpgrade: false,
    typeString: '',
    fuelTypeString: '',
    name: ''
  }
  public selectedItem: WritableSignal<Item[]> = signal([]);
  selectedItemsSet = new Set<number>(); // Set to track selected item IDs
  public childs: WritableSignal<Item[]> = signal([]);
  constructor(private db: AppDB, private http: HttpClient) { }
  //from converts promise to observable

  //Common use cases from the db or more complex stuff
  getItems(): Observable<Item[]> {
    return from(this.db.itemsTable.toArray());
  }

  getTechs(): Observable<Tech[]> {
    return from(this.db.techsTable.toArray());
  }

  getRecipes(): Observable<Recipe[]> {
    return from(this.db.recipesTable.toArray());
  }

  setTypes(types: string[]) {
    this.typesSubject.next(types);
  }

  setFacilityTypes(facilityTypes: string[]) {
    this.facilityTypes.next(facilityTypes);
  }

  isUserFirstTime(): boolean {
    return localStorage.getItem("isFirstTime") === null ? true : false;
  }

  getItemTypes(): Observable<string[]> {
    return from(this.db.itemsTable.toArray()).pipe(
      map(records => {
        const typesValues = new Set(records.map(record => record.Type));
        if (typesValues) {
          return Array.from(typesValues)
        } else {
          return [];
        }
      })
    )
  }

  getAllMachinesByType(typeStringValue: string): Observable<Item[]> {
    return from(this.db.itemsTable.where('typeString').equals(typeStringValue).toArray());
  }

  getAllMadeFromStringRecipes(): Observable<string[]> {
    return from(this.db.recipesTable.toArray()).pipe(
      map(records => {
        const madeFromStrings = new Set(records.map(record => record.madeFromString))
        return Array.from(madeFromStrings)
      })
    )
  }

  getItemTypeString(): Observable<string[]> {
    return from(this.db.itemsTable.toArray()).pipe(
      map(records => {
        const filterRecordsByProduction = records.filter(record => record.Type === "Production");
        const typesValues = new Set(filterRecordsByProduction.map(record => record.typeString));
        if (typesValues) {
          return Array.from(typesValues)
        } else {
          return [];
        }
      })
    )
  }

  isSelected(selectedItem: Item): boolean {
    return this.selectedItemsSet.has(selectedItem.ID);
  }

  toggleSelection(selectedItem: Item, modal?: HTMLDialogElement) {
    if (this.isSelected(selectedItem)) {
      // Remove item from the Set and the signal array
      this.selectedItemsSet.delete(selectedItem.ID);
      this.selectedItem.set(this.selectedItem().filter(item => item.ID !== selectedItem.ID));
    } else {
      // Add item to the Set and the signal array
      this.selectedItemsSet.add(selectedItem.ID);
      this.selectedItem.set([...this.selectedItem(), selectedItem]);
    }

    console.log("Selected items:", this.selectedItem());
    console.log("computed items ", this.selectedItemsSet);
    this.getRecipesFromSelectedItems()
    // Close modal if provided
    if (modal) {
      // modal.close();
    }
  }
  
  async getRecipesFromSelectedItems() {
    const selectedItems = this.selectedItem(); 
    console.log("Selected items in data management:", selectedItems);
  
    this.setChilds([]); 
  
    selectedItems.forEach(item => {
      this.setChilds([...this.getChilds(), item]); // Add the selected item to the childs signal
    });
    const promises = selectedItems.map(item => this.processRecipe(item));
    
    await Promise.all(promises); // Wait for all processRecipe calls to complete

  }
  

  async processRecipe(item: Item) {
    try {
      let recipesSelection: Recipe[] = [];
  
      if (item.recipes !== undefined) {
        const promises = item.recipes.map(async rec => {
          let recipeFound = await this.db.recipesTable.where('ID').equals(rec.ID).first();
          if (recipeFound) {
            recipesSelection.push(recipeFound);
          }
        });
  
        await Promise.all(promises); // Ensure all recipe fetching is completed
      }
  
      console.log('recipesSelection:', recipesSelection);
      const advancedRecipeFound = recipesSelection.find(recipe => recipe.name.includes('advanced') && recipe.Explicit === true);
  
      if (advancedRecipeFound) {
        console.log('At least one recipe contains "advanced" in its name.', advancedRecipeFound);
        for (let itemId of advancedRecipeFound.Items) {
          const item = await this.db.itemsTable.where('ID').equals(itemId).toArray();
          if (item.length > 0) {
            const itemObject = item[0];
            this.setChilds([...this.getChilds(), itemObject]); // Update using signal
          }
        }
      } else {
        console.log('No recipe contains "advanced" in its name.');
        for (let itemId of recipesSelection[0].Items) {
          const item = await this.db.itemsTable.where('ID').equals(itemId).toArray();
          if (item.length > 0) {
            const itemObject = item[0];
            this.setChilds([...this.getChilds(), itemObject]); // Update using signal
            await this.processRecipe(itemObject); // Recursive call
          }
        }
      }
    } catch (error) {
      console.error('Error processing recipe:', error);
    }
  
    console.log('childs2:', this.getChilds()); // Updated after every async operation
  }

  getChilds(): Item[] {
    return this.childs();
  }

  setChilds(newChilds: Item[]): void {
    this.childs.set(newChilds); // Use signal's set method to update state
  }
}
