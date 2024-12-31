import { Component, OnInit, WritableSignal, effect } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { AppDB } from '../../services/db';
import { Recipe } from '../../interfaces/mainData/Recipe';
import { CommonModule } from '@angular/common';
import { TransformedItems } from '../../interfaces/transformed-items';
import { GlobalSettingsServiceService } from '../../services/global-settings-service.service';
import { PowerConversionPipe } from '../../pipes/power-conversion.pipe';
@Component({
  selector: 'app-table-ratios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    PowerConversionPipe,
  ],
  templateUrl: './table-ratios.component.html',
  styleUrl: './table-ratios.component.scss',
})
export class TableRatiosComponent implements OnInit {
  public recipesForm!: FormGroup;
  public childs: Item[] = [];
  public recipesImages: Recipe[] = [];
  public isRecipesFormInitialized: boolean = false;
  previousFormValues: any = {};
  public globalSettingsForm!: FormGroup;

  constructor(
    public dataManagement: DataManagementService,
    private db: AppDB,
    private fb: FormBuilder,
    private globalSettingsService: GlobalSettingsServiceService
  ) {
    effect(() => {
      this.childs = this.dataManagement.childs();
      this.recipesForm = this.dataManagement.recipesForm;
      this.recipesImages = this.dataManagement.recipesImages();
      this.isRecipesFormInitialized =
        this.dataManagement.isRecipesFormInitialized();
    });
  }
  storePreviousValues() {
    this.previousFormValues = { ...this.recipesForm.value };
  }
  ngOnInit(): void {
    this.recipesForm = this.fb.group({});
  }

  async getRecipesImages(recipeId: number): Promise<string[]> {
    let srcImages: string[] = [];
    let recipe = await this.db.recipesTable
      .where('ID')
      .equals(recipeId)
      .toArray();

    if (recipe.length > 0) {
      for (const element of recipe[0].Items) {
        let item = await this.db.itemsTable
          .where('ID')
          .equals(element)
          .toArray();
        if (item.length > 0) {
          srcImages.push(item[0].IconPath);
        }
      }
    }

    return srcImages;
  }
  async changeRecipeSelection(
    item: TransformedItems,
    index: string
  ): Promise<void> {
    const changedRecipe: { [key: string]: number } = {};
    const oldRecipe: { [key: string]: number } = {};

    for (const key in this.recipesForm.value) {
      if (this.recipesForm.value[key] !== this.previousFormValues[key]) {
        changedRecipe[key] = this.recipesForm.value[key];
        oldRecipe[key] = this.previousFormValues[key];
      }
    }

    if (
      Object.keys(oldRecipe).length > 0 &&
      Object.keys(changedRecipe).length > 0
    ) {
      await this.removeSubtreeByIndex(index);
    }

    if (Object.keys(changedRecipe).length > 0) {
      const newRecipeId = changedRecipe[Object.keys(changedRecipe)[0]];
      try {
        const newSubtree = await this.buildNewSubtree(
          item,
          newRecipeId,
          item.totalValue
        );
        this.replaceSubtreeByIndex(index, newSubtree);

        await this.processSingleRecipeImage(newRecipeId);
      } catch (error) {
        console.error(
          `Error building new subtree for recipe ${newRecipeId}:`,
          error
        );
      }
    }
  }

  replaceSubtreeByIndex(index: string, newItem: TransformedItems) {
    // Convertir el índice de cadena a un array de números
    const indexArray = index
      .toString()
      .split('-')
      .map((i) => parseInt(i, 10));

    // Obtener los ítems seleccionados
    let items = this.dataManagement.selectedItems();

    // Función para navegar en los índices y encontrar el ítem
    let currentItem = items;
    for (let i = 0; i < indexArray.length - 1; i++) {
      currentItem = currentItem[indexArray[i]].childs;
    }

    // Reemplazar el ítem con el nuevo subárbol en la posición exacta
    currentItem[indexArray[indexArray.length - 1]] = newItem;

    // Actualizar la señal para reflejar los cambios
    this.dataManagement.selectedItems.set(items);
  }

  removeSubtreeByIndex(index: string) {
    // Convertir el índice de cadena a un array de números

    const indexArray = index
      .toString()
      .split('-')
      .map((i) => parseInt(i, 10));

    // Obtener los ítems seleccionados
    let items = this.dataManagement.selectedItems();

    // Función para navegar en los índices
    let currentItem = items;
    for (let i = 0; i < indexArray.length - 1; i++) {
      currentItem = currentItem[indexArray[i]].childs;
    }

    // Eliminar el subárbol vaciando el array de `childs` del ítem encontrado
    const itemToRemove = currentItem[indexArray[indexArray.length - 1]];
    if (itemToRemove) {
      this.removeRecipeImages(itemToRemove);
      itemToRemove.childs = [];
    }

    // Actualizar la señal para reflejar los cambios
    this.dataManagement.selectedItems.set(items);
  }

  removeRecipeImages(item: TransformedItems) {
    this.dataManagement.recipesImages.set(
      this.dataManagement
        .recipesImages()
        .filter((recipe) => recipe.ID !== item.ID)
    );
    this.dataManagement.imagesRecipes =
      this.dataManagement.imagesRecipes.filter((rec) => rec.ID !== item.ID);

    if (item.childs.length > 0) {
      for (const child of item.childs) {
        this.removeRecipeImages(child);
      }
    }
  }

  async processSingleRecipeImage(recipe: any) {
    const recipeEntry: { ID: number; items: string[]; results: string[] } = {
      ID: recipe.ID,
      items: [],
      results: [],
    };
    if (recipe.items !== undefined) {
      // Procesar el array de items
      for (const element of recipe.Items) {
        try {
          const itemFound = await this.db.itemsTable
            .where('ID')
            .equals(element)
            .first();
          if (itemFound) {
            recipeEntry.items.push(itemFound.IconPath);
          }
        } catch (error) {
          console.error('Error processing items for recipe:', recipe.ID, error);
        }
      }

      // Procesar el array de results
      for (const element of recipe.Results) {
        try {
          const resultFound = await this.db.itemsTable
            .where('ID')
            .equals(element)
            .first();
          if (resultFound) {
            recipeEntry.results.push(resultFound.IconPath);
          }
        } catch (error) {
          console.error(
            'Error processing results for recipe:',
            recipe.ID,
            error
          );
        }
      }

      // Agregar la receta procesada a imagesRecipes
      this.dataManagement.imagesRecipes.push(recipeEntry);
    }
  }

  isRecipeRelatedToItem(recipe: any, item: TransformedItems): boolean {
    // Verificar si la receta está relacionada con el ítem o alguno de sus childs
    if (recipe.ID === item.ID) {
      return true;
    }

    // Revisar recursivamente en los childs
    for (let child of item.childs) {
      if (this.isRecipeRelatedToItem(recipe, child)) {
        return true;
      }
    }

    return false;
  }

  async buildNewSubtree(
    item: TransformedItems,
    recipeId: number,
    parentTotalValue: number = 1
  ): Promise<TransformedItems> {
    for (const recipe of item.recipes) {
      let recipeDetails = await this.db.recipesTable
        .where('ID')
        .equals(recipe.ID)
        .toArray();
      this.dataManagement.recipesImages.set([
        ...this.dataManagement.recipesImages(),
        recipeDetails[0],
      ]);
      await this.ProcessrecipeImage(recipeDetails[0]);
    }

    let recipe = await this.db.recipesTable
      .where('ID')
      .equals(recipeId)
      .toArray();
    if (!recipe[0]) {
      console.error('No recipe found for ID:', recipeId);
      return item;
    }

    const resultCount = recipe[0].ResultCounts[0] || 1; // Fallback to 1 if no resultCount exists

    const newItem: TransformedItems = {
      ...item,
      childs: [],
      totalValue: parentTotalValue, // Inherit from parent
    };

    this.recipesForm.addControl(
      item.ID.toString(),
      new FormControl(recipe[0].ID)
    );

    for (let i = 0; i < recipe[0].Items.length; i++) {
      const itemId = recipe[0].Items[i];
      let itemFound = await this.db.itemsTable
        .where('ID')
        .equals(itemId)
        .toArray();

      let madeFromString = '';
      if (itemFound[0].recipes && itemFound[0].recipes.length > 0) {
        let childRecipe = await this.db.recipesTable
          .where('ID')
          .equals(itemFound[0].recipes[0].ID)
          .toArray();
        madeFromString = childRecipe[0]?.madeFromString || '';
      } else {
        madeFromString = itemFound[0].IsFluid
          ? 'Oil Extraction Facility'
          : 'Mining Facility';
      }

      const childTotalValue =
        (newItem.totalValue * recipe[0].ItemCounts[i]) / resultCount;

      const childItem: TransformedItems = {
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
        totalValue: childTotalValue,
        totalMachine: 0,
        power: 0,
      };

      if (
        itemFound[0].recipes !== undefined &&
        itemFound[0].recipes.length > 0
      ) {
        const recursiveChildItem = await this.buildNewSubtree(
          childItem,
          itemFound[0].recipes[0]?.ID,
          childTotalValue
        );
        newItem.childs.push(recursiveChildItem);
      } else {
        newItem.childs.push(childItem);
      }
    }

    return newItem;
  }

  async ProcessrecipeImage(recipeDetails: any) {
    const recipeEntry: { ID: number; items: string[]; results: string[] } = {
      ID: recipeDetails.ID,
      items: [],
      results: [],
    };

    // Procesar los items de la receta
    for (const element of recipeDetails.Items) {
      try {
        const itemFound = await this.db.itemsTable
          .where('ID')
          .equals(element)
          .first();
        if (itemFound) {
          recipeEntry.items.push(itemFound.IconPath);
        }
      } catch (error) {
        console.error(`Error processing item ID: ${element}`, error);
      }
    }

    // Procesar los resultados de la receta
    for (const element of recipeDetails.Results) {
      try {
        const resultFound = await this.db.itemsTable
          .where('ID')
          .equals(element)
          .first();
        if (resultFound) {
          recipeEntry.results.push(resultFound.IconPath);
        }
      } catch (error) {
        console.error(`Error processing result ID: ${element}`, error);
      }
    }

    // Añadir la receta procesada a imagesRecipes
    this.dataManagement.imagesRecipes.push(recipeEntry);
  }

  getRecipeImage(recipeId: number) {
    let src = '';
    if (this.recipesImages.find((rec) => rec.ID === recipeId)) {
      src = `assets/${this.recipesImages.find((rec) => rec.ID === recipeId)?.IconPath}.png`;
    }
    return src;
  }
  getRecipesItemsSrc(recipeID: number): string[] {
    let recipe = this.dataManagement.imagesRecipes.find(
      (el) => el.ID === recipeID
    );

    if (recipe && recipe.items !== undefined) {
      return this.dataManagement.imagesRecipes.find((el) => el.ID === recipeID)!
        .items;
    } else {
      return [];
    }
  }
  getRecipesResultsSrc(recipeID: number): string[] {
    let recipe = this.dataManagement.imagesRecipes.find(
      (el) => el.ID === recipeID
    );

    if (recipe && recipe.results !== undefined) {
      return this.dataManagement.imagesRecipes.find((el) => el.ID === recipeID)!
        .results;
    } else {
      return [];
    }
  }
  async makeItOre(item: Item) {
    let recipe = await this.db.itemsTable
      .where('name')
      .equals(item.name)
      .toArray();
  }
  previousValue(recipeId: number) {}

  getMachineFromRecipe(itemId: number) {}

  getRecipeSelection(recipeId: number) {}

  roundNumber(item: TransformedItems): number {
    // const globalValues = this.dataManagement.globalSettingsFormSignal();
    // const control = globalValues[item.madeFromString.split(' ')[0].toLowerCase() + 'Select'];
    let result: number = 0;
    let resultIndex = item.Results.findIndex((id) => id === item.ID);
    let resultQuantity = item.ResultCounts[resultIndex];
    let timeConstant: number = 0;
    let key = this.globalSettingsService.checkValidKey(
      item.madeFromString.split(' ')[0].toLowerCase() + 'Select'
    );

    if (key) {
      const property = this.globalSettingsService.getProperty(key);
      if (
        typeof property === 'object' &&
        property !== null &&
        'prefabDesc' in property
      ) {
        const assemblerSpeed = property?.prefabDesc?.assemblerSpeed;
      }
    }
    return result;
    // let indexOfItem = item.ResultCounts.findIndex(id => id === item.ID);

    // let value =
    //   (item.TimeSpend / 60) /
    //   ((control?.prefabDesc?.assemblerSpeed / 10000)) ;

    // return Number(value.toFixed(2));
  }
}
// [1203,1204,1205]
