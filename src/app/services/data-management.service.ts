import { effect, Injectable, output, signal, WritableSignal } from '@angular/core';
import Dexie, { liveQuery, Table } from 'dexie';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { AppDB } from './db';
import { Tech } from '../interfaces/mainData/Tech';
import { Recipe } from '../interfaces/mainData/Recipe';
import { FormBuilder, FormControl, FormGroup, NumberValueAccessor } from '@angular/forms';
import { recipes, TransformedItems } from '../interfaces/transformed-items';
import { GlobalSettingsFormValues } from '../interfaces/mainData/global-settings-form-values';
import { GlobalSettingsServiceService } from './global-settings-service.service';
import { Item } from '../interfaces/mainData/Item';
import { Totals } from '../interfaces/miscTypes/totals';
import { TotalItems } from '../interfaces/miscTypes/TotalItems';
@Injectable({
  providedIn: 'root',
})
export class DataManagementService {
  public recipesForm: FormGroup = new FormGroup({});
  public isRecipesFormInitialized = signal(false); // Flag to track form initialization

  private typesSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public types$: Observable<string[]> = this.typesSubject.asObservable();

  private facilityTypes: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public facilityTypes$: Observable<string[]> = this.facilityTypes.asObservable();
  powerFacilitiesMap: WritableSignal<{ [key: string]: string }> = signal({});
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
      name: '',
    },
    maincraft: {
      ID: 0,
      name: '',
    },
    handcraftProductCount: 0,
    maincraftProductCount: 0,
    handcrafts: [],
    recipes: [],
    makes: [],
    rawMats: [],
    preTech: {
      ID: 0,
      name: '',
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
          y: 0,
        },
        ext: {},
        q: {
          w: 0,
        },
        shape: '',
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
        y: 0,
      },
      blueprintBoxSize: {
        x: 0,
        y: 0,
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
        y: 0,
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
      audioDoppler: 0,
      minerPeriod: 0,
      labAssembleSpeed: 0,
      beltSpeed: 0
    },
    ID: 0,
    description: '',
    index: 0,
    iconSprite: '',
    canUpgrade: false,
    typeString: '',
    fuelTypeString: '',
    name: '',
    isRaw: false,
  };

  public selectedItems: WritableSignal<TransformedItems[]> = signal([]);
  selectedItemsSet = new Set<number>();

  public childs: WritableSignal<Item[]> = signal([]);
  public recipesImages: WritableSignal<Recipe[]> = signal([]);
  public imagesRecipes: { ID: number; items: string[]; results: string[] }[] = [];
  public recipesFromTreeStructure: WritableSignal<Recipe[]> = signal([]);
  public powerFacilities: { typeString: string; IconPath: string }[] = [];
  public totals: WritableSignal<Totals> = signal({
    totalPower: 0,
    totalMachinesByType: [],
    totalItems: [],
  });

  public beltStackSize = signal(1);
  public beltTransportFactor = 6;

  constructor(
    private db: AppDB,
    private http: HttpClient,
    private fb: FormBuilder,
    private globalSettingsService: GlobalSettingsServiceService
  ) {
    effect(() => {
      const globalSetting = this.globalSettingsService.globalSettingsSignal();
      console.log(globalSetting);
    });
  }

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
    return localStorage.getItem('isFirstTime') === null ? true : false;
  }

  getItemTypes(): Observable<string[]> {
    return from(this.db.itemsTable.toArray()).pipe(
      map((records) => {
        const typesValues = new Set(records.map((record) => record.Type));
        if (typesValues) {
          return Array.from(typesValues);
        } else {
          return [];
        }
      })
    );
  }

  getAllMachinesByType(typeStringValue: string): Observable<Item[]> {
    return from(this.db.itemsTable.where('typeString').equals(typeStringValue).toArray());
  }

  getAllMadeFromStringRecipes(): Observable<string[]> {
    return from(this.db.recipesTable.toArray()).pipe(
      map((records) => {
        const madeFromStrings = new Set(records.map((record) => record.madeFromString));
        return Array.from(madeFromStrings);
      })
    );
  }

  getItemTypeString(): Observable<{ typeString: string; IconPath: string }[]> {
    return from(this.db.itemsTable.where('Type').equals('Production').toArray()).pipe(
      map((records) =>
        records
          .filter((record) => record.typeString && record.IconPath)
          .map((record) => ({
            typeString: record.typeString,
            IconPath: record.IconPath,
          }))
      )
    );
  }

  getMadeFromString(): Observable<string[]> {
    return from(this.db.recipesTable.toArray()).pipe(
      map((records) => {
        const madeFromStrings = new Set(records.map((record) => record.madeFromString));
        return Array.from(madeFromStrings);
      })
    );
  }

  isSelectedItem(selectedItem: TransformedItems): boolean {
    return this.selectedItemsSet.has(selectedItem.ID);
  }

  public allItems: Item[] = [];
  public allRecipes: Recipe[] = [];

  public itemsMap: Map<number, Item> = new Map<number, Item>()
  public recipesMap: Map<number, Recipe> = new Map<number, Recipe>();

  async preloadData(): Promise<void> {
    const start = performance.now();

    this.allItems = await this.db.itemsTable.toArray();
    this.allRecipes = await this.db.recipesTable.toArray();

    this.itemsMap = new Map(this.allItems.map(item => [item.ID, item]));
    this.recipesMap = new Map(this.allRecipes.map(recipe => [recipe.ID, recipe]));
    const end = performance.now();
    console.warn(`Preloading Time: ${(end - start) / 1000} seconds`);
  }
  async toggleSelection(selectedItem: Item, modal?: HTMLDialogElement) {

    const start = performance.now();

    if (this.itemsMap.size === 0 || this.recipesMap.size === 0) {
      console.log('Data still preloading...')
      await this.preloadData();
    }

    this.isRecipesFormInitialized.set(false);
    this.recipesForm = new FormGroup({});
    this.recipesFromTreeStructure.set([]);

    const recipeToUse = selectedItem.recipes.find((recipe) => recipe.name.toLowerCase().includes('advanced')) || selectedItem.recipes[0];

    this.recipesForm.addControl(selectedItem.ID.toString(), new FormControl(recipeToUse.ID));

    const recipe = this.recipesMap.get(recipeToUse.ID);

    if (recipe === undefined) return;

    const resultIndex = recipe?.Results.findIndex((resultId) => resultId === selectedItem.ID);

    let totalMachine = this.calculateMachinesNeeded(
      this.globalSettingsService.getProperty('initialAmountValue'),
      recipe.ResultCounts[resultIndex],
      recipe.TimeSpend,
      this.globalSettingsService.checkValidKey(recipe.madeFromString.split(' ')[0].toLowerCase() + 'Select')
    );

    //this should be in another function
    let energyPerMachine = 0;
    let key = this.globalSettingsService.checkValidKey(recipe.madeFromString.split(' ')[0].toLowerCase() + 'Select');

    if (key !== null) {
      const property = this.globalSettingsService.getProperty(key);
      if (typeof property === 'object' && property !== null && 'prefabDesc' in property) {
        energyPerMachine = (property.prefabDesc.workEnergyPerTick * 60) / 1000;
      }
    }

    const setupTime = performance.now();

    const newItem: TransformedItems = {
      ID: selectedItem.ID,
      name: selectedItem.name,
      Type: selectedItem.Type,
      IconPath: selectedItem.IconPath,
      GridIndex: selectedItem.GridIndex,
      recipes: selectedItem.recipes,
      typeString: selectedItem.typeString,
      fuelTypeString: selectedItem.fuelTypeString,
      childs: [],
      madeFromString: recipe.madeFromString,
      TimeSpend: recipe.TimeSpend,
      Items: recipe.Items,
      ItemCounts: recipe.ItemCounts,
      Results: recipe.Results,
      ResultCounts: recipe.ResultCounts,
      totalValue: this.globalSettingsService.getProperty('initialAmountValue'),
      totalMachine: totalMachine,
      power: Number((energyPerMachine * totalMachine).toFixed(2)),
      beltsNeeded: this.globalSettingsService.getProperty('initialAmountValue') / (this.globalSettingsService.getProperty('beltSelect').prefabDesc.beltSpeed * this.beltTransportFactor * this.beltStackSize()) /
        (this.globalSettingsService.getProperty('unitSelected') === 'm' ? 60 : 1)
    };

    if (this.isSelectedItem(newItem)) {
      this.selectedItemsSet.delete(newItem.ID);
      this.selectedItems.set(this.selectedItems().filter((item) => item.ID !== newItem.ID));
    } else {
      this.selectedItemsSet.add(newItem.ID);
      this.selectedItems.set([...this.selectedItems(), newItem]);
    }

    const beforeTreeStructure = performance.now();

    for (const item of this.selectedItems()) {
      await this.createTreeStructure(item);
    }

    const afterTreeStructure = performance.now();
    this.processRecipesImages();
    this.getItemTypeString()
      .pipe(
        switchMap((data) => {
          const machines = data.map((item) => {
            const key = this.getControlName(item.typeString);
            if (!key) return null;

            const selectedFacility = this.globalSettingsService.getProperty(key) as Item | undefined;
            if (!selectedFacility) return null;

            return {
              typeString: item.typeString,
              IconPath: selectedFacility.IconPath,
              machineId: selectedFacility.ID,
            };
          });

          const validMachines = machines.filter((machine) => machine !== null) as {
            typeString: string;
            IconPath: string;
            machineId: number;
          }[];

          return of(validMachines);
        })
      )
      .subscribe({
        next: (facilities) => {
          const updatedMap = { ...this.powerFacilitiesMap() };

          facilities.forEach((facility: { typeString: string; IconPath: string; machineId: number }) => {
            if (facility.typeString && facility.IconPath) {
              updatedMap[facility.typeString] = facility.IconPath;
            }
          });
          const proliferatorItem = this.globalSettingsService.getProperty('proliferationSelect') as Item | undefined;
          if (proliferatorItem) {
            updatedMap['proliferator'] = proliferatorItem.IconPath;
          }

          const beltItem = this.globalSettingsService.getProperty('beltSelect') as Item | undefined;
          if (beltItem) {
            updatedMap['belt'] = beltItem.IconPath;
          }


          this.powerFacilitiesMap.set(updatedMap);
          console.log('powerFacilities', this.powerFacilitiesMap());
        },
        error: (err) => {
          console.error('Error:', err);
        },
      });

    console.log(this.selectedItems());
    this.isRecipesFormInitialized.set(true);
    const end = performance.now();

    console.log(`Setup Time: ${(setupTime - start) / 1000} seconds`);
    console.log(`Tree Structure Time: ${(afterTreeStructure - beforeTreeStructure) / 1000} seconds`);
    console.log(`Remaining Function Time: ${(end - afterTreeStructure) / 1000} seconds`);

    this.calculateTotales(this.selectedItems());
    console.log(this.totals());
  }

  async createTreeStructure(item: TransformedItems): Promise<void> {
    if (!item.recipes || item.recipes.length === 0) return;

    const recipeIds = item.recipes.map((recipe) => recipe.ID);
    const recipeDetails = recipeIds
      .map((id) => this.recipesMap.get(id))
      .filter((recipe): recipe is Recipe => recipe !== undefined);

    this.recipesImages.set([...this.recipesImages(), ...recipeDetails]);

    const recipeToUse = item.recipes.find((recipe) => recipe.name.includes('advanced')) || item.recipes[0];

    if (!recipeToUse) return;

    this.recipesForm.addControl(item.ID.toString(), new FormControl(recipeToUse.ID));

    const recipe = this.recipesMap.get(recipeToUse.ID);
    if (!recipe) return;

    const itemsForCurrentRecipe = recipe.Items.map((id) => this.itemsMap.get(id)).filter((item): item is Item => item !== undefined);

    const childPromises = itemsForCurrentRecipe.map(async (currentItem) => {
      let madeFromString = '';
      if (currentItem.recipes && currentItem.recipes.length > 0) {
        const childRecipe = this.recipesMap.get(currentItem.recipes[0].ID);
        madeFromString = childRecipe?.madeFromString || '';
      } else {
        madeFromString = currentItem.IsFluid ? 'Oil Extraction Facility' : 'Mining Facility';
      }

      const childRecipeToUse = await this.getRecipeToUse(currentItem);
      if (childRecipeToUse) {
        const childRecipeDetails = this.recipesMap.get(childRecipeToUse.ID);
        if (childRecipeDetails) {
          const resultIndex = recipe.Results.indexOf(item.ID);
          const resultCount = resultIndex >= 0 ? recipe.ResultCounts[resultIndex] : 1;
          const itemCount = recipe.ItemCounts[recipe.Items.indexOf(currentItem.ID)] || 1;

          const totalValue = (item.totalValue * itemCount) / resultCount;
          const resultItemIndex = childRecipeDetails.Results.indexOf(currentItem.ID);

          const newItem = this.createNewItem(
            currentItem,
            madeFromString,
            childRecipeDetails,
            totalValue,
            resultItemIndex
          );

          this.recipesForm.addControl(newItem.ID.toString(), new FormControl(childRecipeDetails.ID));
          item.childs.push(newItem);

          await this.createTreeStructure(newItem);
        }
      } else {
        const resultItemIndex = recipe.Results.indexOf(currentItem.ID);
        const coreItem = this.createCoreItem(currentItem, madeFromString, recipe, item, resultItemIndex);
        item.childs.push(coreItem);
      }
    })

    await Promise.all(childPromises);
  }

  createCoreItem(
    currentItem: Item,
    madeFromString: string,
    recipe: Recipe,
    parentItem: TransformedItems,
    resultItemIndex: number
  ): TransformedItems {
    let key = this.globalSettingsService.checkValidKey(madeFromString.split(' ')[0].toLowerCase() + 'Select');
    let energyPerMachine = 0;
    if (key !== null) {
      const property = this.globalSettingsService.getProperty(key);
      if (typeof property === 'object' && property !== null && 'prefabDesc' in property) {
        energyPerMachine = (property.prefabDesc.workEnergyPerTick * 60) / 1000;
      }
    }

    let totalMachine = this.calculateMachinesNeeded(
      parentItem.totalValue,
      recipe.ResultCounts[resultItemIndex],
      recipe.TimeSpend,
      this.globalSettingsService.checkValidKey(madeFromString.split(' ')[0].toLowerCase() + 'Select')
    );
    return {
      ID: currentItem.ID,
      name: currentItem.name,
      Type: currentItem.Type,
      IconPath: currentItem.IconPath,
      GridIndex: currentItem.GridIndex,
      recipes: [],
      typeString: currentItem.typeString,
      fuelTypeString: currentItem.fuelTypeString,
      childs: [],
      madeFromString: madeFromString,
      TimeSpend: 0,
      Items: [],
      ItemCounts: [],
      Results: [],
      ResultCounts: [],
      totalValue: parentItem.totalValue * recipe.ItemCounts[recipe.Items.indexOf(currentItem.ID)] || 0,
      totalMachine: this.calculateMachinesNeeded(
        parentItem.totalValue,
        recipe.ResultCounts[resultItemIndex],
        recipe.TimeSpend,
        this.globalSettingsService.checkValidKey(madeFromString.split(' ')[0].toLowerCase() + 'Select')
      ),
      power: Number((energyPerMachine * totalMachine).toFixed(2)),
      beltsNeeded: (parentItem.totalValue * recipe.ItemCounts[recipe.Items.indexOf(currentItem.ID)] || 0) / (this.globalSettingsService.getProperty('beltSelect').prefabDesc.beltSpeed * this.beltTransportFactor * this.beltStackSize()) /
        (this.globalSettingsService.getProperty('unitSelected') === 'm' ? 60 : 1)
    };
  }

  createNewItem(
    currentItem: Item,
    madeFromString: string,
    childRecipeDetails: Recipe,
    totalValue: number,
    resultItemIndex: number
  ): TransformedItems {
    let key = this.globalSettingsService.checkValidKey(madeFromString.split(' ')[0].toLowerCase() + 'Select');
    let energyPerMachine = 0;
    if (key !== null) {
      const property = this.globalSettingsService.getProperty(key);
      if (typeof property === 'object' && property !== null && 'prefabDesc' in property) {
        energyPerMachine = (property.prefabDesc.workEnergyPerTick * 60) / 1000;
      }
    }

    let totalMachine = this.calculateMachinesNeeded(
      totalValue,
      childRecipeDetails.ResultCounts[resultItemIndex],
      childRecipeDetails.TimeSpend,
      this.globalSettingsService.checkValidKey(madeFromString.split(' ')[0].toLowerCase() + 'Select')
    );
    return {
      ID: currentItem.ID,
      name: currentItem.name,
      Type: currentItem.Type,
      IconPath: currentItem.IconPath,
      GridIndex: currentItem.GridIndex,
      recipes: currentItem.recipes,
      typeString: currentItem.typeString,
      fuelTypeString: currentItem.fuelTypeString,
      childs: [],
      madeFromString: madeFromString,
      TimeSpend: childRecipeDetails.TimeSpend,
      Items: childRecipeDetails.Items,
      ItemCounts: childRecipeDetails.ItemCounts,
      Results: childRecipeDetails.Results,
      ResultCounts: childRecipeDetails.ResultCounts,
      totalValue: totalValue,
      totalMachine: totalMachine,
      power: Number((energyPerMachine * totalMachine).toFixed(2)),
      beltsNeeded: totalValue /
        (this.globalSettingsService.getProperty('beltSelect').prefabDesc.beltSpeed *
          this.beltTransportFactor *
          this.beltStackSize()) /
        (this.globalSettingsService.getProperty('unitSelected') === 'm' ? 60 : 1)
    };
  }

  calculateMachinesNeeded(
    desiredOutput: number,
    itemsPerRecipe: number,
    recipeTime: number,
    machineType: keyof GlobalSettingsFormValues | null
  ) {
    let machinesNeeded = 0;
    if (machineType !== null) {
      const property = this.globalSettingsService.getProperty(machineType);
      if (typeof property === 'object' && property !== null && 'prefabDesc' in property) {
        let assemblerSpeed = 0;
        if (machineType === 'miningSelect') {
          recipeTime = 120;
          assemblerSpeed = property?.prefabDesc?.minerPeriod;
        } else if (machineType === 'researchSelect') {
          assemblerSpeed = property.prefabDesc.labAssembleSpeed;
        } else {
          assemblerSpeed = property?.prefabDesc?.assemblerSpeed;
        }
        const outputUnit = this.globalSettingsService.getProperty('unitSelected');
        const desiredItemsPerMinute = outputUnit === 's' ? desiredOutput * 60 : desiredOutput;
        const itemsPerMachinePerMinute = ((itemsPerRecipe * 60) / (recipeTime / 60)) * (assemblerSpeed / 10000);
        machinesNeeded = desiredItemsPerMinute / itemsPerMachinePerMinute;
      }
    }
    return Number(machinesNeeded.toFixed(2));
  }

  async getRecipeToUse(item: Item): Promise<recipes | null> {
    if (!item.recipes || item.recipes.length === 0) {
      return null;
    }
    return item.recipes.find((r) => r.name.includes('advanced')) || item.recipes[0];
  }

  getControlName(typeString: string): keyof GlobalSettingsFormValues | null {
    switch (typeString) {
      case 'Assembler':
        return 'assemblerSelect';
      case 'Mining Facility':
        return 'miningSelect';
      case 'Smelting Facility':
        return 'smeltingSelect';
      case 'Research Facility':
        return 'researchSelect';
      case 'Chemical Facility':
        return 'chemicalSelect';
      case 'Refining Facility':
        return 'refiningSelect';
      case 'Oil Extraction Facility':
        return 'oilSelect';

      default:
        console.warn(`Unrecognized typeString: ${typeString}`);
        return null;
    }
  }

  async processRecipes(item: TransformedItems) {
    // Verifica y procesa las recetas en el nivel actual
    if (item.recipes) {
      let containsAdvancedRecipe = item.recipes.findIndex((recipe) => recipe.name.includes('advanced'));
      if (containsAdvancedRecipe !== -1) {
        this.recipesForm.addControl(item.ID.toString(), new FormControl(item.recipes[containsAdvancedRecipe].ID));
      } else {
        this.recipesForm.addControl(item.ID.toString(), new FormControl(item.recipes[0].ID));
      }
      for (const recipe of item.recipes) {
        if (recipe.name.includes('advanced')) {
          this.recipesForm.addControl(item.ID.toString(), new FormControl(recipe.ID));
        }
        let recipeFound = await this.db.recipesTable.where('ID').equals(recipe.ID).toArray();
        this.recipesFromTreeStructure().push(recipeFound[0]);
      }
    }

    // Recorre recursivamente los childs si existen
    if (item.childs) {
      for (const child of item.childs) {
        await this.processRecipes(child); // Llama recursivamente a la función para cada hijo
      }
    }
  }

  updateForm(): void {
    this.recipesForm = new FormGroup({});
    this.getChilds().forEach((child) => {
      if (child.recipes !== undefined) {
        // Verificamos que cumpla con las condiciones para agregar el FormControl
        if (child.recipes.length > 1 || (child.recipes.length > 0 && child.typeString === 'Natural Resource')) {
          //
          if (!this.recipesForm.contains(child.ID.toString())) {
            // Condiciones para seleccionar automáticamente un valor
            let defaultValue = null;
            if (child.recipes.find((rec) => rec.name.includes('advanced'))) {
              defaultValue = child.recipes.find((rec) => rec.name.includes('advanced'))!.ID;
            } else {
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
    this.imagesRecipes = [];

    for (const recipe of this.recipesImages()) {
      const recipeEntry: { ID: number; items: string[]; results: string[] } = {
        ID: recipe.ID,
        items: [],
        results: [],
      };

      for (const element of recipe.Items) {
        try {
          const itemFound = await this.db.itemsTable.where('ID').equals(element).first();
          if (itemFound) {
            recipeEntry.items.push(itemFound.IconPath);
          }
        } catch (error) { }
      }

      for (const element of recipe.Results) {
        try {
          const resultFound = await this.db.itemsTable.where('ID').equals(element).first();
          if (resultFound) {
            recipeEntry.results.push(resultFound.IconPath);
          }
        } catch (error) { }
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
        const promises = item.recipes.map(async (rec) => {
          let recipeFound = await this.db.recipesTable.where('ID').equals(rec.ID).first();
          if (recipeFound) {
            recipesSelection.push(recipeFound);
            this.recipesImages.set([...this.recipesImages(), recipeFound]);
          }
        });

        await Promise.all(promises); // Ensure all recipe fetching is completed
      }

      const advancedRecipeFound = recipesSelection.find(
        (recipe) => recipe.name.includes('advanced') && recipe.Explicit === true
      );
      if (this.recipesForm.value.hasOwnProperty(item.ID)) {
      }
      if (advancedRecipeFound) {
        for (let itemId of advancedRecipeFound.Items) {
          const item = await this.db.itemsTable.where('ID').equals(itemId).toArray();
          if (item.length > 0) {
            const itemObject = item[0];
            this.setChilds([...this.getChilds(), itemObject]); // Update using signal
            await this.processRecipe(itemObject);
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
    } catch (error) { }
  }

  getChilds(): Item[] {
    return this.childs();
  }

  setChilds(newChilds: Item[]): void {
    this.childs.set(newChilds); // Use signal's set method to update state
  }

  getItemById(itemId: number) {
    return from(this.db.itemsTable.where('ID').equals(itemId).toArray());
  }
  getRecipeById(recipeId: number) {
    return from(this.db.recipesTable.where('ID').equals(recipeId).toArray());
  }

  calculateTotales(selectedItems: TransformedItems[]): void {
    const totals: Totals = {
      totalPower: 0,
      totalMachinesByType: [],
      totalItems: [],
    };

    const accumulateValues = (item: TransformedItems) => {
      totals.totalPower += item.power || 0;

      if (item.madeFromString) {
        const machineEntry = totals.totalMachinesByType.find((entry) => entry.name === item.madeFromString);
        if (machineEntry) {
          machineEntry.total += item.totalMachine || 0;
        } else {
          totals.totalMachinesByType.push({
            name: item.madeFromString,
            total: item.totalMachine || 0,
          });
        }
      }

      const itemEntry = totals.totalItems.find((entry) => entry.name === item.name);
      if (itemEntry) {
        itemEntry.total += item.totalValue || 0;
      } else {
        totals.totalItems.push({
          itemId: item.ID,
          name: item.name,
          total: item.totalValue || 0,
          IconPath: item.IconPath,
        });
      }

      for (const child of item.childs) {
        accumulateValues(child);
      }
    };

    for (const tree of selectedItems) {
      accumulateValues(tree);
    }
    this.totals.set(totals);
    const sortedItems = [...this.totals().totalItems].sort((a, b) => a.itemId - b.itemId);

    this.totals.set({ ...this.totals(), totalItems: sortedItems });
  }

  getProliferatorItems() {
    return from(this.db.itemsTable.where('name').startsWith('Proliferator').toArray());
  }

  getBeltItems() {
    return from(this.db.itemsTable.where('name').startsWith('Conveyor Belt').toArray());
  }

}
