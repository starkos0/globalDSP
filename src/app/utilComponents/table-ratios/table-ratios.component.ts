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
import { createBlendy } from 'blendy';

@Component({
    selector: 'app-table-ratios',
    imports: [ReactiveFormsModule, CommonModule, FormsModule, PowerConversionPipe],
    templateUrl: './table-ratios.component.html',
    styleUrl: './table-ratios.component.scss'
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

    if (item.childs.length > 0) {
      await this.dataManagement.updateChildNodesAfterRecipeChange(item, recipe.ID);
      this.dataManagement.preprocessAllRecipes([item]);

    }

  }

  changeItemTotalValue(item: TransformedItems, newTotalValue?: number) {
    if(newTotalValue){
      item.totalValue = newTotalValue
    }
    const recipe = this.dataManagement.recipesMap.get(item.selectedRecipe.ID);
    if (recipe) {
      const resultitemindex = recipe.Results.indexOf(item.ID);
      item.totalMachine = this.dataManagement.calculateMachinesNeeded(
        item.totalValue,
        item.ResultCounts[resultitemindex],
        item.TimeSpend,
        this.globalSettingsService.checkValidKey(item.madeFromString.split(' ')[0].toLowerCase() + 'Select')
      );
    }
    console.log(item)
    let selectedItems = this.dataManagement.selectedItems();
    this.dataManagement.selectedItems.set([...selectedItems]);
    const originalNode = item;

    this.updateSubtree(originalNode);
    this.updateUpwards(originalNode);
  }

  updateSubtree(node: TransformedItems) {
    for (const child of node.childs) {
      this.calculateTotalValueForChild(node, child);
      this.updateSubtree(child);
    }
  }

  updateUpwards(originalNode: TransformedItems) {
    let current = originalNode;

    while (true) {
      const parent = this.findParentNode(this.dataManagement.selectedItems(), current.nodeUUID);
      if (!parent) {
        console.warn("🔝 No more parents to update.");
        break;
      }

      if (parent.childs.length === 1) {
        console.log(`🔼 Updating single-child parent: ${parent.name}`);
        this.calculateTotalValueForParent(parent);
      } else {
        console.log(`🟠 Parent has multiple children. Updating siblings first.`);
        this.updateSiblings(parent, current);
        break; // Stop further upwards updates, let updateSiblings handle it.
      }

      current = parent; // Move upwards
    }
  }

  updateSiblings(parent: TransformedItems, updatedChild: TransformedItems) {
    console.log(`🔄 Updating siblings for parent: ${parent.name}`);

    const recipeDetails = this.dataManagement.recipesMap.get(parent.selectedRecipe.ID);
    if (!recipeDetails) {
      console.warn(`⚠️ Recipe details missing for ${parent.name}`);
      return;
    }

    // Find the updated child in the recipe
    const updatedChildIndex = recipeDetails.Items.indexOf(updatedChild.ID);
    if (updatedChildIndex === -1) {
      console.warn(`⚠️ Updated child ${updatedChild.name} not found in parent recipe.`);
      return;
    }

    const updatedChildAmount = recipeDetails.ItemCounts[updatedChildIndex];
    const missingSiblings = parent.childs.filter(child => child.nodeUUID !== updatedChild.nodeUUID);

    for (const sibling of missingSiblings) {
      const siblingIndex = recipeDetails.Items.indexOf(sibling.ID);
      if (siblingIndex === -1) {
        console.warn(`⚠️ Sibling ${sibling.name} not found in parent recipe.`);
        continue;
      }

      const siblingAmount = recipeDetails.ItemCounts[siblingIndex];

      const siblingTotalValue = (updatedChild.totalValue * siblingAmount) / updatedChildAmount;

      console.log(`🔹 Calculated sibling ${sibling.name}: ${siblingTotalValue}`);
      sibling.totalValue = siblingTotalValue;

      this.updateSubtree(sibling);
    }

    this.calculateTotalValueForParent(parent);
    this.updateUpwards(parent);
  }

  calculateTotalValueForParent(node: TransformedItems) {
    const recipeDetails = this.dataManagement.recipesMap.get(node.selectedRecipe.ID);
    if (!recipeDetails) {
      console.warn(`⚠️ Recipe details not found for parent: ${node.name}`);
      return;
    }

    const child = node.childs[0];

    const itemIndex = recipeDetails.Items.indexOf(child.ID);
    const itemCount = itemIndex >= 0 ? recipeDetails.ItemCounts[itemIndex] : 1;
    const resultIndex = recipeDetails.Results.indexOf(node.ID);
    const resultCount = resultIndex >= 0 ? recipeDetails.ResultCounts[resultIndex] : 1;

    if (itemIndex === -1 || resultIndex === -1) {
      console.warn(`⚠️ Parent ${node.name} cannot be updated due to missing recipe mappings.`);
      return;
    }

    // Apply the totalValue formula
    node.totalValue = (child.totalValue * resultCount) / itemCount;

    node.totalMachine = this.dataManagement.calculateMachinesNeeded(
      node.totalValue,
      recipeDetails.ResultCounts[resultIndex],
      recipeDetails.TimeSpend,
      this.globalSettingsService.checkValidKey(node.madeFromString.split(' ')[0].toLowerCase() + 'Select')
    );
    console.log(node)
    node.power = node.totalValue * 10;
  }

  calculateTotalValueForChild(parent: TransformedItems, child: TransformedItems) {
    const recipeDetails = this.dataManagement.recipesMap.get(parent.selectedRecipe.ID);
    if (!recipeDetails) {
      console.warn("⚠️ Recipe details not found for parent:", parent.name);
      return;
    }

    const resultIndex = recipeDetails.Results.indexOf(parent.ID);
    const resultCount = resultIndex >= 0 ? recipeDetails.ResultCounts[resultIndex] : 1;

    const itemIndex = recipeDetails.Items.indexOf(child.ID);
    const itemCount = itemIndex >= 0 ? recipeDetails.ItemCounts[itemIndex] : 1;

    if (itemIndex === -1 || resultIndex === -1) {
      console.warn("⚠️ Invalid indices for child:", child.name);
      return;
    }

    child.totalValue = (parent.totalValue * itemCount) / resultCount;

    child.totalMachine = this.dataManagement.calculateMachinesNeeded(
      child.totalValue,
      recipeDetails.ItemCounts[itemIndex],
      child.TimeSpend,
      this.globalSettingsService.checkValidKey(child.madeFromString.split(' ')[0].toLowerCase() + 'Select')
    );
    if(child.name.toLowerCase().includes("circuit") || child.name.toLowerCase().includes("processor")){
      console.log(recipeDetails)
    }
    child.power = child.totalValue * 10;
  }

  findParentNode(tree: TransformedItems[], childUUID: string): TransformedItems | null {
    for (const node of tree) {
      if (node.childs.some(child => child.nodeUUID === childUUID)) {
        return node;
      }

      const parent = this.findParentNode(node.childs, childUUID);
      if (parent) return parent;
    }
    return null;
  }
  private blendy: any;

  ngAfterViewInit() {
    this.blendy = createBlendy({
      animation: 'dynamic'
    });
  }

  toggleTransition() {
    this.blendy.toggle('transicion-ejemplo');
  }
}
