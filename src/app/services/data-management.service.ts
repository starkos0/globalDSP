import { Injectable, signal, WritableSignal } from '@angular/core';
import Dexie, { liveQuery, Table } from 'dexie';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, from, map, Observable, switchMap } from 'rxjs';
import { AppDB } from './db';
import { Tech } from '../interfaces/mainData/Tech';
import { Recipe } from '../interfaces/mainData/Recipe';
import { Item } from '../interfaces/mainData/Item';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TransformedItems } from '../interfaces/transformed-items';
@Injectable({
  providedIn: 'root'
})
export class DataManagementService {
  public recipesForm: FormGroup = new FormGroup({});
  public isRecipesFormInitialized = signal(false); // Flag to track form initialization

  private globalSettingsForm!: FormGroup;

  // Initialize the form
  initializeForm(defaultItem: any) {
    this.globalSettingsForm = new FormGroup({
      initialAmountValue: new FormControl(60),
      unitSelected: new FormControl('m'),
      assemblerSelect: new FormControl(defaultItem),
      smelterSelect: new FormControl(defaultItem),
      miningmachineSelect: new FormControl(defaultItem),
      matrixLabSelect: new FormControl(defaultItem),
      chemicalplantSelect: new FormControl(defaultItem)
    });

  }

  getGlobalSettingsForm(): FormGroup {
    return this.globalSettingsForm;
  }


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
    name: '',
    isRaw: false
  }

  public selectedItems: WritableSignal<TransformedItems[]> = signal([]);
  selectedItemsSet = new Set<number>();

  public childs: WritableSignal<Item[]> = signal([]);
  public recipesImages: WritableSignal<Recipe[]> = signal([]);
  public imagesRecipes: { ID: number, items: string[], results: string[] }[] = []
  public recipesFromTreeStructure: WritableSignal<Recipe[]> = signal([]);
  public powerFacilities: { typeString: string; IconPath: string }[] = [];



  constructor(private db: AppDB, private http: HttpClient, private fb: FormBuilder) { }
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

  getItemTypeString(): Observable<{ typeString: string; IconPath: string }[]> {
    return from(this.db.itemsTable.toArray()).pipe(
      map(records => {
        const filterRecordsByProduction = records.filter(record => record.Type === "Production");

        const uniqueRecordsMap = new Map(
          filterRecordsByProduction
            .filter(record => record.typeString && record.IconPath) // Filtrar registros válidos
            .map(record => [record.typeString, { typeString: record.typeString, IconPath: record.IconPath }])
        );

        return Array.from(uniqueRecordsMap.values());
      })
    );
  }


  getMadeFromString(): Observable<string[]> {
    return from(this.db.recipesTable.toArray()).pipe(
      map(records => {
        const madeFromStrings = new Set(records.map(record => record.madeFromString))
        return Array.from(madeFromStrings)
      })
    )
  }

  isSelectedItem(selectedItem: TransformedItems): boolean {
    return this.selectedItemsSet.has(selectedItem.ID);
  }

  async toggleSelection(selectedItem: Item, modal?: HTMLDialogElement) {
    console.log("assembler speed: ", this.globalSettingsForm.get('assemblerSelect')?.value.prefabDesc.assemblerSpeed)
    this.isRecipesFormInitialized.set(false);
    this.recipesForm = new FormGroup({});

    this.recipesFromTreeStructure.set([]);

    let advancedRecipeFound = selectedItem.recipes.find(recipe => recipe.name.includes('advanced'));
    let recipeToUse = advancedRecipeFound ? advancedRecipeFound : selectedItem.recipes[0]; // Usar la primera receta si no hay ninguna avanzada

    this.recipesForm.addControl(selectedItem.ID.toString(), new FormControl(recipeToUse.ID));
    let recipe = await this.db.recipesTable.where('ID').equals(recipeToUse.ID).toArray();
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
      madeFromString: recipe[0].madeFromString,
      TimeSpend: recipe[0].TimeSpend,
      Items: recipe[0].Items,
      ItemCounts: recipe[0].ItemCounts,
      Results: recipe[0].Results,
      ResultCounts: recipe[0].ResultCounts,
      totalValue: this.globalSettingsForm.get('initialAmountValue')?.value
    }
    if (this.isSelectedItem(newItem)) {
      this.selectedItemsSet.delete(newItem.ID);
      this.selectedItems.set(this.selectedItems().filter(item => item.ID !== newItem.ID))
    } else {
      this.selectedItemsSet.add(newItem.ID);
      this.selectedItems.set([...this.selectedItems(), newItem])
    }


    for (const item of this.selectedItems()) {
      await this.createTreeStructure(item);
    }


    this.processRecipesImages();
    this.getItemTypeString().pipe(
      switchMap(data => {
        const machineObservables = data.map((item: { typeString: string; IconPath: string }) =>
          this.getAllMachinesByType(item.typeString).pipe(
            map(res => {
              switch (item.typeString) {
                case 'Assembler':
                  this.setFormControlWithLocalStorage('assemblerSelect', res, 'savedAssemblerID');
                  break;
                case 'Mining Facility':
                  this.setFormControlWithLocalStorage('miningmachineSelect', res, 'savedMiningMachineID');
                  break;
                case 'Smelting Facility':
                  this.setFormControlWithLocalStorage('smelterSelect', res, 'savedSmelterID');
                  break;
                case 'Research Facility':
                  this.setFormControlWithLocalStorage('matrixLabSelect', res, 'savedMatrixLabID');
                  break;
                case 'Chemical Facility':
                  this.setFormControlWithLocalStorage('chemicalplantSelect', res, 'savedChemicalPlantID');
                  break;
                default:
                  break;
              }

              const selectedFacility = this.globalSettingsForm.get(this.getControlName(item.typeString))?.value;
              return { typeString: item.typeString, IconPath: selectedFacility?.IconPath, machineId: selectedFacility?.ID };
            })
          )
        );

        return forkJoin(machineObservables);
      })
    ).subscribe({
      next: facilities => {
        const updatedMap = { ...this.powerFacilitiesMap() };

        facilities.forEach(facility => {
          if (facility.typeString && facility.IconPath) {
            updatedMap[facility.typeString] = facility.IconPath;
          }
        });

        this.powerFacilitiesMap.set(updatedMap);
        console.log("powerFacilities ", this.powerFacilitiesMap())
      },
      error: err => {
        console.error('Error:', err);
      }
    });

    console.log(this.selectedItems())
    this.isRecipesFormInitialized.set(true);

  }
  getControlName(typeString: string): string {
    switch (typeString) {
      case 'Assembler': return 'assemblerSelect';
      case 'Mining Facility': return 'miningmachineSelect';
      case 'Smelting Facility': return 'smelterSelect';
      case 'Research Facility': return 'matrixLabSelect';
      case 'Chemical Facility': return 'chemicalplantSelect';
      default: return '';
    }
  }

  setFormControlWithLocalStorage(controlName: string, options: Item[], localStorageKey: string) {
    const savedID = localStorage.getItem(localStorageKey);
    // 
    if (savedID) {
      const selectedItem = options.find(item => item.ID === parseInt(savedID, 10));
      if (selectedItem) {
        this.globalSettingsForm.get(controlName)?.setValue(selectedItem);
      } else {
        this.globalSettingsForm.get(controlName)?.setValue(options[0]);
      }
    } else {
      this.globalSettingsForm.get(controlName)?.setValue(options[0]);
    }
  }

  async processRecipes(item: TransformedItems) {
    // Verifica y procesa las recetas en el nivel actual
    if (item.recipes) {
      let containsAdvancedRecipe = item.recipes.findIndex(recipe => recipe.name.includes('advanced'));
      if (containsAdvancedRecipe !== -1) {
        this.recipesForm.addControl(item.ID.toString(), new FormControl(item.recipes[containsAdvancedRecipe].ID));
      } else {
        this.recipesForm.addControl(item.ID.toString(), new FormControl(item.recipes[0].ID));
      }
      for (const recipe of item.recipes) {
        if (recipe.name.includes("advanced")) {
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


  async createTreeStructure(item: TransformedItems) {
    if (item.recipes !== undefined) {
      // Guardar todas las recetas en recipesImages
      for (const recipe of item.recipes) {
        let recipeDetails = await this.db.recipesTable.where('ID').equals(recipe.ID).toArray();
        this.recipesImages.set([...this.recipesImages(), recipeDetails[0]]);
      }

      let advancedRecipeFound = item.recipes.find(recipe => recipe.name.includes('advanced'));
      let recipeToUse = advancedRecipeFound ? advancedRecipeFound : item.recipes[0]; // Usar la primera receta si no hay ninguna avanzada

      if (recipeToUse) {
        this.recipesForm.addControl(item.ID.toString(), new FormControl(recipeToUse.ID));

        let recipe = await this.db.recipesTable.where('ID').equals(recipeToUse.ID).toArray();
        for (const itemId of recipe[0].Items) {
          let itemFound = await this.db.itemsTable.where('ID').equals(itemId).toArray();

          // Verificación adicional: asegurarse de que itemFound[0] tenga recetas
          let madeFromString = "";
          if (itemFound[0].recipes && itemFound[0].recipes.length > 0) {
            let childRecipe = await this.db.recipesTable.where('ID').equals(itemFound[0].recipes[0].ID).toArray();
            madeFromString = childRecipe[0]?.madeFromString || "";
          } else {
            if (itemFound[0].IsFluid) {
              madeFromString = "Oil Extraction Facility";
            } else {
              madeFromString = "Mining Facility";
            }
          }

          const newItem: TransformedItems = {
            ID: itemFound[0].ID,
            name: itemFound[0].name,
            Type: itemFound[0].Type,
            IconPath: itemFound[0].IconPath,
            GridIndex: itemFound[0].GridIndex,
            recipes: itemFound[0].recipes,
            typeString: itemFound[0].typeString,
            fuelTypeString: itemFound[0].fuelTypeString,
            childs: [],
            madeFromString: madeFromString,
            TimeSpend: recipe[0].TimeSpend,
            Items: recipe[0].Items,
            ItemCounts: recipe[0].ItemCounts,
            Results: recipe[0].Results,
            ResultCounts: recipe[0].ResultCounts,
            totalValue: 0
          };

          item.childs.push(newItem);
          await this.createTreeStructure(newItem); // Llamada recursiva para seguir construyendo el árbol
        }
      }
    }
  }

  updateForm(): void {
    this.recipesForm = new FormGroup({});
    this.getChilds().forEach((child) => {
      if (child.recipes !== undefined) {
        // Verificamos que cumpla con las condiciones para agregar el FormControl
        if (child.recipes.length > 1 || (child.recipes.length > 0 && child.typeString === "Natural Resource")) {
          // 
          if (!this.recipesForm.contains(child.ID.toString())) {
            // Condiciones para seleccionar automáticamente un valor
            let defaultValue = null;
            if (child.recipes.find(rec => rec.name.includes("advanced"))) {
              defaultValue = child.recipes.find(rec => rec.name.includes("advanced"))!.ID
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
      const recipeEntry: { ID: number, items: string[], results: string[] } = {
        ID: recipe.ID,
        items: [],
        results: []
      };

      for (const element of recipe.Items) {
        try {
          const itemFound = await this.db.itemsTable.where('ID').equals(element).first();
          if (itemFound) {
            recipeEntry.items.push(itemFound.IconPath);
          }
        } catch (error) {

        }
      }

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

    } catch (error) {

    }

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
}
