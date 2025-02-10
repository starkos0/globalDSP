import { Component, OnInit, WritableSignal, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { AppDB } from '../../services/db';
import { Recipe } from '../../interfaces/mainData/Recipe';
import { CommonModule } from '@angular/common';
import { recipes, TransformedItems } from '../../interfaces/transformed-items';
import { GlobalSettingsServiceService } from '../../services/global-settings-service.service';
import { PowerConversionPipe } from '../../pipes/power-conversion.pipe';
import { PreprocessedRecipe } from '../../interfaces/mainData/preprocessed-item';

@Component({
  selector: 'app-table-ratios',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, PowerConversionPipe],
  templateUrl: './table-ratios.component.html',
  styleUrl: './table-ratios.component.scss',
})
export class TableRatiosComponent implements OnInit {
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
      this.recipesImages = this.dataManagement.recipesImages();
      this.isRecipesFormInitialized = this.dataManagement.isRecipesFormInitialized();
    });
  }
  storePreviousValues() {
  }
  ngOnInit(): void {
  }

  async getRecipesImages(recipeId: number): Promise<string[]> {
    let srcImages: string[] = [];
    let recipe = await this.db.recipesTable.where('ID').equals(recipeId).toArray();

    if (recipe.length > 0) {
      for (const element of recipe[0].Items) {
        let item = await this.db.itemsTable.where('ID').equals(element).toArray();
        if (item.length > 0) {
          srcImages.push(item[0].IconPath);
        }
      }
    }

    return srcImages;
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
      itemToRemove.childs = [];
    }

    // Actualizar la señal para reflejar los cambios
    this.dataManagement.selectedItems.set(items);
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
          const itemFound = await this.db.itemsTable.where('ID').equals(element).first();
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
          const resultFound = await this.db.itemsTable.where('ID').equals(element).first();
          if (resultFound) {
            recipeEntry.results.push(resultFound.IconPath);
          }
        } catch (error) {
          console.error('Error processing results for recipe:', recipe.ID, error);
        }
      }

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

  async buildNewSubtree(item: TransformedItems, recipeSelected: recipes, parentTotalValue: number = 1): Promise<TransformedItems> {
    for (const recipe of item.recipes) {
      let recipeDetails = await this.db.recipesTable.where('ID').equals(recipe.ID).toArray();
      this.dataManagement.recipesImages.set([...this.dataManagement.recipesImages(), recipeDetails[0]]);
    }

    let recipe = await this.db.recipesTable.where('ID').equals(recipeSelected.ID).toArray();
    if (!recipe[0]) {
      console.error('No recipe found for ID:', recipeSelected.ID);
      return item;
    }

    const resultCount = recipe[0].ResultCounts[0] || 1; // Fallback to 1 if no resultCount exists

    const newItem: TransformedItems = {
      ...item,
      childs: [],
      totalValue: parentTotalValue, // Inherit from parent
    };


    for (let i = 0; i < recipe[0].Items.length; i++) {
      const itemId = recipe[0].Items[i];
      let itemFound = await this.db.itemsTable.where('ID').equals(itemId).toArray();

      let madeFromString = '';
      if (itemFound[0].recipes && itemFound[0].recipes.length > 0) {
        let childRecipe = await this.db.recipesTable.where('ID').equals(itemFound[0].recipes[0].ID).toArray();
        madeFromString = childRecipe[0]?.madeFromString || '';
      } else {
        madeFromString = itemFound[0].IsFluid ? 'Oil Extraction Facility' : 'Mining Facility';
      }

      const childTotalValue = (newItem.totalValue * recipe[0].ItemCounts[i]) / resultCount;

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
        beltsNeeded:
          childTotalValue /
          (this.globalSettingsService.getProperty('beltSelect').prefabDesc.beltSpeed *
            this.dataManagement.beltTransportFactor *
            this.dataManagement.beltStackSize()),
        selectedRecipe: {
          ID: recipeSelected.ID,
          name: recipeSelected.name
        },
        nodeUUID: crypto.randomUUID()
      };

      if (itemFound[0].recipes !== undefined && itemFound[0].recipes.length > 0) {
        const recursiveChildItem = await this.buildNewSubtree(childItem, itemFound[0].recipes[0], childTotalValue);
        newItem.childs.push(recursiveChildItem);
      } else {
        newItem.childs.push(childItem);
      }
    }

    return newItem;
  }


  async makeItOre(item: Item) {
    let recipe = await this.db.itemsTable.where('name').equals(item.name).toArray();
  }
  previousValue(recipeId: number) { }

  getMachineFromRecipe(itemId: number) { }

  getRecipeSelection(recipeId: number) { }

  roundNumber(item: TransformedItems): number {
    // const globalValues = this.dataManagement.globalSettingsFormSignal();
    // const control = globalValues[item.madeFromString.split(' ')[0].toLowerCase() + 'Select'];
    let result: number = 0;
    let resultIndex = item.Results.findIndex((id) => id === item.ID);
    let resultQuantity = item.ResultCounts[resultIndex];
    let timeConstant: number = 0;
    let key = this.globalSettingsService.checkValidKey(item.madeFromString.split(' ')[0].toLowerCase() + 'Select');

    if (key) {
      const property = this.globalSettingsService.getProperty(key);
      if (typeof property === 'object' && property !== null && 'prefabDesc' in property) {
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

  async updateSelectedRecipe(item: TransformedItems, recipe: PreprocessedRecipe) {
    item.selectedRecipe = { ID: recipe.ID, name: recipe.name };
    console.log(item.nodeUUID);
    if (item.childs.length > 0) {
      await this.dataManagement.updateChildNodesAfterRecipeChange(item, recipe.ID);
      this.dataManagement.preprocessAllRecipes([item]);

    }
    console.log(this.dataManagement.preprocessedRecipesMap)
  }
  changeItemTotalValue(item: TransformedItems) {
    this.propagateDownwards(item);
    this.propagateUpwards(item.nodeUUID);

  }

  propagateDownwards(item: TransformedItems): void {

    for (const child of item.childs) {
      const recipeDetails = this.dataManagement.recipesMap.get(item.selectedRecipe.ID);
      if (!recipeDetails) {
        console.warn(`⚠ No recipe details found for: ${item.selectedRecipe.ID}`);
        continue;
      }

      const resultIndex = recipeDetails.Results.indexOf(item.ID);
      const resultCount = resultIndex >= 0 ? recipeDetails.ResultCounts[resultIndex] : 1;

      const itemIndex = recipeDetails.Items.indexOf(child.ID);
      const itemCount = itemIndex >= 0 ? recipeDetails.ItemCounts[itemIndex] : 1;

      if (itemIndex === -1 || resultIndex === -1) {
        console.warn(`⚠ Invalid indices for child-parent relation: ${child.name}`);
        continue;
      }

      const newTotalValue = (item.totalValue * itemCount) / resultCount;

      child.totalValue = newTotalValue;
      child.totalMachine = this.dataManagement.calculateMachinesNeeded(
        newTotalValue,
        resultCount,
        child.TimeSpend,
        this.globalSettingsService.checkValidKey(child.madeFromString.split(' ')[0].toLowerCase() + 'Select')
      );
      child.power = newTotalValue * 10;

      this.propagateDownwards(child);
    }
  }

  propagateUpwards(nodeUUID: string): void {
    const selectedItems = this.dataManagement.selectedItems();

    this.updateParentValues(selectedItems[0], nodeUUID);

    // Set the updated values back into the signal
    this.dataManagement.selectedItems.set(selectedItems);
  }

  updateParentValues(node: TransformedItems, childUUID: string): void {

    const updatedChild = node.childs.find(child => child.nodeUUID === childUUID);
    if (!updatedChild) {
      // Recurse through other children to find where the update should happen
      for (const child of node.childs) {
        this.updateParentValues(child, childUUID);
      }
      return;
    }

    // Find the recipe details for this parent
    const recipeDetails = this.dataManagement.recipesMap.get(node.selectedRecipe.ID);
    if (!recipeDetails) {
      console.warn(`⚠ No recipe details found for: ${node.selectedRecipe.ID}`);
      return;
    }

    // Find the index of the updated child in the recipe
    const itemIndex = recipeDetails.Items.indexOf(updatedChild.ID);
    if (itemIndex === -1) {
      console.warn(`⚠ Child ${updatedChild.name} not found in parent ${node.name} recipe`);
      return;
    }

    const itemCount = recipeDetails.ItemCounts[itemIndex];
    const resultIndex = recipeDetails.Results.indexOf(node.ID);
    const resultCount = resultIndex >= 0 ? recipeDetails.ResultCounts[resultIndex] : 1;

    // Compute new totalValue for parent based on the recipe
    const newTotalValue = (updatedChild.totalValue * resultCount) / itemCount;

    // Apply the new value
    node.totalValue = newTotalValue;
    node.totalMachine = this.dataManagement.calculateMachinesNeeded(
      newTotalValue,
      node.ResultCounts[0], // Should be dynamically fetched
      node.TimeSpend,
      this.globalSettingsService.checkValidKey(node.madeFromString.split(' ')[0].toLowerCase() + 'Select')
    );
    node.power = newTotalValue * 10;

    // Continue propagating upwards
    this.propagateUpwards(node.nodeUUID);
  }



  updateNodeInSelectedItems(nodeUUID: string, updatedValues: Partial<TransformedItems>): void {
    const updatedTrees = this.dataManagement.selectedItems().map(tree =>
      this.updateNodeRecursively(tree, nodeUUID, updatedValues)
    );

    this.dataManagement.selectedItems.set(updatedTrees);
  }

  updateNodeRecursively(
    node: TransformedItems,
    nodeUUID: string,
    updatedValues: Partial<TransformedItems>
  ): TransformedItems {
    if (node.nodeUUID === nodeUUID) {
      return { ...node, ...updatedValues };
    }

    return {
      ...node,
      childs: node.childs.map(child =>
        this.updateNodeRecursively(child, nodeUUID, updatedValues)
      ),
    };
  }


}
