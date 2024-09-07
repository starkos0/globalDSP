import { Injectable, signal, WritableSignal } from '@angular/core';
import Dexie, { liveQuery, Table } from 'dexie';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { AppDB } from './db';
import { Tech } from '../interfaces/mainData/Tech';
import { Recipe } from '../interfaces/mainData/Recipe';
import { Item } from '../interfaces/mainData/Item';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class DataManagementService {
  private _globalSettingsForm!: FormGroup;
  public recipesForm: FormGroup = new FormGroup({});
  public isRecipesFormInitialized = signal(false); // Flag to track form initialization

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
  public recipesImages: WritableSignal<Recipe[]> = signal([]);
  public imagesRecipes: {ID:number,items: string[],results: string[]}[] = []

  
  constructor(private db: AppDB, private http: HttpClient, private fb: FormBuilder) { }
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
    this.getRecipesFromSelectedItems()
  }
  
  async getRecipesFromSelectedItems() {
    const selectedItems = this.selectedItem(); // Get the selected items from the signal
    this.setChilds([]); 
    this.isRecipesFormInitialized.set(false)
    for (const item of selectedItems) {
      this.setChilds([...this.getChilds(), item]);
      await this.processRecipe(item);
    }
    this.imagesRecipes.length = 0 
    await this.processRecipesImages()
    this.updateForm()
    console.log("childs: ", this.childs());
    console.log("recipesForm: ", this.recipesForm.value)
    console.log("recipes images: ", this.imagesRecipes)
    console.log(" recipesImages(): ", this.recipesImages())
  }

  updateForm(): void {
    this.recipesForm = new FormGroup({});
    this.getChilds().forEach((child) => {
      if (child.recipes !== undefined) {
        // Verificamos que cumpla con las condiciones para agregar el FormControl
        if (child.recipes.length > 1 || (child.recipes.length > 0 && child.typeString === "Natural Resource")) {
          console.log(child.name)
          if (!this.recipesForm.contains(child.ID.toString())) {
            // Condiciones para seleccionar automáticamente un valor
            let defaultValue = null;
            if(child.recipes.find(rec => rec.name.includes("advanced"))){
              defaultValue = child.recipes.find(rec => rec.name.includes("advanced"))!.ID
            }else{
              defaultValue = child.recipes[0].ID;

            }

            // Agregar el FormControl con el valor por defecto
            this.recipesForm.addControl(child.ID.toString(), new FormControl(defaultValue));
          }
        }
      }
    });

    this.isRecipesFormInitialized.set(true);
    
}

  async processRecipesImages() {
    // Reset imagesRecipes to ensure it's empty before processing
    this.imagesRecipes = [];
  
    // Use for...of loop to handle asynchronous operations properly
    for (const recipe of this.recipesImages()) {
      const recipeEntry: {ID:number,items: string[],results: string[]} = {
        ID: recipe.ID,
        items: [],
        results: []
      };
  
      // Process items array with await inside a for...of loop
      for (const element of recipe.Items) {
        try {
          const itemFound = await this.db.itemsTable.where('ID').equals(element).first();
          if (itemFound) {
            recipeEntry.items.push(itemFound.IconPath);
          }
        } catch (error) {
          
        }
      }
  
      // Process results array with await inside a for...of loop
      for (const element of recipe.Results) {
        try {
          const resultFound = await this.db.itemsTable.where('ID').equals(element).first();
          if (resultFound) {
            recipeEntry.results.push(resultFound.IconPath);
          }
        } catch (error) {
          
        }
      }
  
      // Push the fully populated recipe entry to imagesRecipes
      this.imagesRecipes.push(recipeEntry);
    }
  }
  
  async processRecipe(item: Item) {
    try {
      // this.recipesImages.set([])
      let recipesSelection: Recipe[] = [];
  
      if (item.recipes !== undefined) {
        const promises = item.recipes.map(async rec => {
          let recipeFound = await this.db.recipesTable.where('ID').equals(rec.ID).first();
          if (recipeFound) {
            recipesSelection.push(recipeFound);
            this.recipesImages.set([...this.recipesImages(), recipeFound])
          }
        });
  
        await Promise.all(promises); // Ensure all recipe fetching is completed
      }
  
      
      const advancedRecipeFound = recipesSelection.find(recipe => recipe.name.includes('advanced') && recipe.Explicit === true);
      if(this.recipesForm.value.hasOwnProperty(item.ID)){
        
      }
      if (advancedRecipeFound) {
        
        for (let itemId of advancedRecipeFound.Items) {
          const item = await this.db.itemsTable.where('ID').equals(itemId).toArray();
          if (item.length > 0) {
            const itemObject = item[0];
            this.setChilds([...this.getChilds(), itemObject]); // Update using signal
          }
        }
      } else {
        
        for (let itemId of recipesSelection[0].Items) {
          const item = await this.db.itemsTable.where('ID').equals(itemId).toArray();
          if (item.length > 0) {
            const itemObject = item[0];
            this.setChilds([...this.getChilds(), itemObject]); // Update using signal
            await this.processRecipe(itemObject); // Recursive call
          }
        }
      }
      console.log("recipe selection: ", recipesSelection)
    } catch (error) {
      
    }
    
  }

  getChilds(): Item[] {
    return this.childs();
  }

  setChilds(newChilds: Item[]): void {
    this.childs.set(newChilds); // Use signal's set method to update state
  }

  getItemById(itemId: number){
    return from(this.db.itemsTable.where('ID').equals(itemId).toArray());
  }
  getRecipeById(recipeId: number){
    return from(this.db.recipesTable.where('ID').equals(recipeId).toArray());
  }
}
