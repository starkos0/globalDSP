import { Component, OnInit, WritableSignal, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { AppDB } from '../../services/db';
import { Recipe } from '../../interfaces/mainData/Recipe';
import { CommonModule } from '@angular/common';
import { TransformedItems } from '../../interfaces/transformed-items';

@Component({
  selector: 'app-table-ratios',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './table-ratios.component.html',
  styleUrl: './table-ratios.component.scss'
})
export class TableRatiosComponent implements OnInit {
  public globalSettingsForm!: FormGroup;
  public recipesForm!: FormGroup;
  public childs: Item[] = [];
  public recipesImages: Recipe[] = []
  public isRecipesFormInitialized: boolean = false;
  previousFormValues: any = {};
  
  constructor(public dataManagement: DataManagementService, private db: AppDB, private fb: FormBuilder) {
    effect(() => {

      this.childs = this.dataManagement.childs()
      this.recipesForm = this.dataManagement.recipesForm;
      this.recipesImages = this.dataManagement.recipesImages();
      this.isRecipesFormInitialized = this.dataManagement.isRecipesFormInitialized()
    });
  }
  storePreviousValues(itemId: number) {
    this.previousFormValues = { ...this.recipesForm.value };
    // 
  }
  ngOnInit(): void {
    

    this.recipesForm.valueChanges.subscribe(values => {
    });
    this.globalSettingsForm = this.dataManagement.globalSettingsForm;
    this.globalSettingsForm.valueChanges.subscribe(values => {
      console.log(values)
    })
    this.recipesForm = this.fb.group({});
    this.recipesForm.valueChanges.subscribe(values => {

    })

  }
  performActionOnSelectedItems(newItems: Item[]): void {

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
  async changeRecipeSelection(itemId: number, recipeId: string, item: TransformedItems, index: string) {

    const changedRecipe: { [key: string]: number } = {};
    const oldRecipe: { [key: string]: number } = {};
    for (let key in this.recipesForm.value) {
      if (this.recipesForm.value[key] !== this.previousFormValues[key]) {
        changedRecipe[key] = this.recipesForm.value[key]
        oldRecipe[key] = this.previousFormValues[key]
      }
    }

    if (oldRecipe && oldRecipe !== changedRecipe) {
      this.removeSubtreeByIndex(index)
    }
    if (changedRecipe) {
      const newItem = await this.buildNewSubtree(item, changedRecipe[parseInt(Object.keys(changedRecipe)[0])]);
      this.replaceSubtreeByIndex(index, newItem);

      await this.processSingleRecipeImage(changedRecipe[parseInt(Object.keys(changedRecipe)[0])]);
    }
  }
  replaceSubtreeByIndex(index: string, newItem: TransformedItems) {

    // Convertir el índice de cadena a un array de números
    const indexArray = index.toString().split('-').map(i => parseInt(i, 10));

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

    const indexArray = index.toString().split('-').map(i => parseInt(i, 10));

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
      this.removeRecipeImages(itemToRemove)
      itemToRemove.childs = [];
    }

    // Actualizar la señal para reflejar los cambios
    this.dataManagement.selectedItems.set(items);
  }

  removeRecipeImages(item: TransformedItems) {
    this.dataManagement.recipesImages.set(
      this.dataManagement.recipesImages().filter(recipe => recipe.ID !== item.ID)
    )
    this.dataManagement.imagesRecipes = this.dataManagement.imagesRecipes.filter(rec => rec.ID !== item.ID);

    if (item.childs.length > 0) {
      for (const child of item.childs) {
        this.removeRecipeImages(child);
      }
    }
  }

  removeRecipeFromIndex(index: string) {
    const indexArray = index.toString().split('-').map(i => parseInt(i, 10));
    let items = this.dataManagement.selectedItems();

    let currentItem = items;
    for (let i = 0; i < indexArray.length - 1; i++) {
      currentItem = currentItem[indexArray[i]].childs;
    }

    const itemToRemove = currentItem[indexArray[indexArray.length - 1]];
    if (itemToRemove) {
      this.dataManagement.recipesImages.set(
        this.dataManagement.recipesImages().filter(recipe => {
          // Eliminar las imágenes de recetas asociadas con este ítem y sus childs
          return !this.isRecipeRelatedToItem(recipe, itemToRemove);
        })
      )
    }
  }


  async processSingleRecipeImage(recipe: any) {
    const recipeEntry: { ID: number, items: string[], results: string[] } = {
      ID: recipe.ID,
      items: [],
      results: []
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
          console.error("Error processing items for recipe:", recipe.ID, error);
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
          console.error("Error processing results for recipe:", recipe.ID, error);
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

  async buildNewSubtree(item: TransformedItems, recipeId: number): Promise<TransformedItems> {

    for (const recipe of item.recipes) {
      let recipeDetails = await this.db.recipesTable.where('ID').equals(recipe.ID).toArray();
      this.dataManagement.recipesImages.set([...this.dataManagement.recipesImages(), recipeDetails[0]]);
      await this.ProcessrecipeImage(recipeDetails[0]);

    }

    let recipe = await this.db.recipesTable.where('ID').equals(recipeId).toArray();
    if (!recipe[0]) {
      console.error("No recipe found for ID:", recipeId);
      return item;
    }

    const newItem: TransformedItems = {
      ...item,
      childs: []
    };

    this.recipesForm.addControl(item.ID.toString(), new FormControl(recipe[0].ID));

    for (const itemId of recipe[0].Items) {
      let itemFound = await this.db.itemsTable.where('ID').equals(itemId).toArray();

      // Verificación adicional: asegurarse de que itemFound[0] tenga recetas
      let madeFromString = "";
      if (itemFound[0].recipes && itemFound[0].recipes.length > 0) {
        let childRecipe = await this.db.recipesTable.where('ID').equals(itemFound[0].recipes[0].ID).toArray();
        madeFromString = childRecipe[0]?.madeFromString || "";
      } else {
        if(itemFound[0].IsFluid){
          madeFromString = "Oil Extraction Facility";
        }else{
          madeFromString = "Mining Facility";
        }
      }

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
        madeFromString: madeFromString 
      };

      if (itemFound[0].recipes !== undefined && itemFound[0].recipes.length > 0) {

        const recursiveChildItem = await this.buildNewSubtree(childItem, itemFound[0].recipes[0]?.ID);

        newItem.childs.push(recursiveChildItem);
      } else {
        newItem.childs.push(childItem);
      }
    }



    return newItem; // Retornamos el nuevo subárbol
  }

  async ProcessrecipeImage(recipeDetails: any) {
    const recipeEntry: { ID: number, items: string[], results: string[] } = {
      ID: recipeDetails.ID,
      items: [],
      results: []
    };

    // Procesar los items de la receta
    for (const element of recipeDetails.Items) {
      try {
        const itemFound = await this.db.itemsTable.where('ID').equals(element).first();
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
        const resultFound = await this.db.itemsTable.where('ID').equals(element).first();
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



  async removeCurrentRecipe(oldRecipe: { [key: string]: number }) {
    let oldRecipeKey: string = Object.keys(oldRecipe)[0];
    let recipeId = Object.values(oldRecipe)[0];

    //search old recipe in db
    let recipe = await this.db.recipesTable.where("ID").equals(recipeId).toArray();
    if (recipe.length === 0) {

      return;
    }

    let lastItem: number = recipe[0].Items[recipe[0].Items.length - 1];


    //find index of item in this.childs
    let indexOfOldRecipe = this.childs.findIndex(item => item.ID === parseInt(oldRecipeKey));
    if (indexOfOldRecipe === -1) {

      return;
    }
    const eliminarSubarbol = async (itemId: number) => {
      // Eliminar el ítem actual de `this.childs`
      this.childs = this.childs.filter(item => item.ID !== itemId);

      // Buscar la receta en la base de datos
      let childRecipe = await this.db.recipesTable
        .filter(recipe => recipe.Results.includes(itemId))
        .toArray();
      if (itemId === 1104) {


      }
      if (childRecipe.length > 0) {
        // Para cada ítem que es parte de la receta, eliminarlos también recursivamente
        for (let neededItem of childRecipe[0].Items) {

          await eliminarSubarbol(neededItem); // Llamada recursiva para eliminar dependencias
        }
      }
    };

    // Empezar a eliminar desde el índice de la receta cambiada
    for (let i = indexOfOldRecipe + 1; i < this.childs.length; i++) {

      if (this.childs[i].ID === lastItem) {

        // Eliminar el último ítem y salir del bucle
        await eliminarSubarbol(this.childs[i].ID);
        break;
      } else {
        // Eliminar ítems recursivamente
        await eliminarSubarbol(this.childs[i].ID);
        i--; // Ajustar el índice después de eliminar un ítem
      }
    }
  }

  getRecipeImage(recipeId: number) {
    let src = ""
    if (this.recipesImages.find(rec => rec.ID === recipeId)) {
      src = `assets/${this.recipesImages.find(rec => rec.ID === recipeId)?.IconPath}.png`
    }
    return src;
  }
  getRecipesItemsSrc(recipeID: number): string[] {
    let recipe = this.dataManagement.imagesRecipes.find(el => el.ID === recipeID);

    if (recipe && recipe.items !== undefined) {
      return this.dataManagement.imagesRecipes.find(el => el.ID === recipeID)!.items
    } else {
      return []
    }
  }
  getRecipesResultsSrc(recipeID: number): string[] {
    let recipe = this.dataManagement.imagesRecipes.find(el => el.ID === recipeID);

    if (recipe && recipe.results !== undefined) {
      return this.dataManagement.imagesRecipes.find(el => el.ID === recipeID)!.results
    } else {
      return []
    }
  }
  async makeItOre(item: Item) {

    let recipe = await this.db.itemsTable.where('name').equals(item.name).toArray();

  }
  previousValue(recipeId: number) {

  }

  getMachineFromRecipe(itemId: number) {

  }

  getRecipeSelection(recipeId: number) {

  }

}
