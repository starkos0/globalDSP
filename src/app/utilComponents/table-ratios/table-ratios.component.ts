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
      console.log("CHILDS -> ", this.childs)
      this.recipesForm = this.dataManagement.recipesForm;
      this.recipesImages = this.dataManagement.recipesImages();
      this.isRecipesFormInitialized = this.dataManagement.isRecipesFormInitialized()


    });
  }
  storePreviousValues(itemId: number) {
    this.previousFormValues = { ...this.recipesForm.value };
    // console.log('Valor del formulario antes del cambio (click):', this.previousFormValues)
  }
  ngOnInit(): void {

    // Subscribe to value changes
    this.recipesForm.valueChanges.subscribe(values => {

    });
    this.globalSettingsForm = this.dataManagement.globalSettingsForm;
    this.globalSettingsForm.valueChanges.subscribe(values => {
      // 
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

    console.log('Valor del formulario después del cambio (change):', this.recipesForm.value);
    console.log('Valor anterior del formulario:', this.previousFormValues);
    const changedRecipe: { [key: string]: number } = {};
    const oldRecipe: { [key: string]: number } = {};
    for (let key in this.recipesForm.value) {
      if (this.recipesForm.value[key] !== this.previousFormValues[key]) {
        changedRecipe[key] = this.recipesForm.value[key]
        oldRecipe[key] = this.previousFormValues[key]
      }
    }
    console.log("this is the new recipe ", changedRecipe)
    console.log("this is the old recipe: ", oldRecipe)

    if (oldRecipe && oldRecipe !== changedRecipe) {
      this.removeSubtreeByIndex(index)
    }
    if (changedRecipe) {
      // Crear el nuevo subárbol basado en la nueva receta
      const newItem = await this.buildNewSubtree(item, changedRecipe[parseInt(Object.keys(changedRecipe)[0])]);

      // Reemplazar el subárbol en la misma posición en la señal
      this.replaceSubtreeByIndex(index, newItem);
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
    console.log("index: ", index)
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
      itemToRemove.childs = [];
    }
  
    // Actualizar la señal para reflejar los cambios
    this.dataManagement.selectedItems.set(items);
  }
  async buildNewSubtree(item: TransformedItems, recipeId: number): Promise<TransformedItems> {
    console.log("--------- NEW SUBTREE ---------")
    console.log(item)
    console.log(recipeId)
    let recipe = await this.db.recipesTable.where('ID').equals(recipeId).toArray();
    console.log(recipe[0].Items)
    const newItem: TransformedItems = {
      ...item, // Copiar las propiedades originales del ítem
      childs: [], // Inicializamos el nuevo array de childs
    };
  
    // Para cada ítem necesario en la receta, construimos el subárbol
    for (const itemId of recipe[0].Items) {
      let itemFound = await this.db.itemsTable.where('ID').equals(itemId).toArray();
      console.log("itemfound: ",itemFound)
      const childItem: TransformedItems = {
        ID: itemFound[0].ID,
        name: itemFound[0].name,
        Type: itemFound[0].Type,
        IconPath: itemFound[0].IconPath,
        GridIndex: itemFound[0].GridIndex,
        recipes: itemFound[0].recipes,
        typeString: itemFound[0].typeString,
        fuelTypeString: itemFound[0].fuelTypeString,
        childs: []
      };
  
      // Añadir el hijo al nuevo subárbol
      newItem.childs.push(childItem);
      console.log("newItem: ",newItem)
      // Llamada recursiva para construir subárboles de los ítems hijos
      if(itemFound[0].recipes !== undefined){

        await this.buildNewSubtree(childItem, itemFound[0].recipes[0]?.ID);
      }
    }
  
    return newItem; // Retornamos el nuevo subárbol
  }
  

  async removeCurrentRecipe(oldRecipe: { [key: string]: number }) {
    let oldRecipeKey: string = Object.keys(oldRecipe)[0];
    let recipeId = Object.values(oldRecipe)[0];

    //search old recipe in db
    let recipe = await this.db.recipesTable.where("ID").equals(recipeId).toArray();
    if (recipe.length === 0) {
      console.log("Recipe not found");
      return;
    }

    let lastItem: number = recipe[0].Items[recipe[0].Items.length - 1];
    console.log("Last item from the recipe: ", lastItem);

    //find index of item in this.childs
    let indexOfOldRecipe = this.childs.findIndex(item => item.ID === parseInt(oldRecipeKey));
    if (indexOfOldRecipe === -1) {
      console.log("Recipe not found in the current array.");
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
        console.log("XDDDDD")
        console.log(childRecipe)
      }
      if (childRecipe.length > 0) {
        // Para cada ítem que es parte de la receta, eliminarlos también recursivamente
        for (let neededItem of childRecipe[0].Items) {
          console.log("needed Item: ", neededItem)
          await eliminarSubarbol(neededItem); // Llamada recursiva para eliminar dependencias
        }
      }
    };

    // Empezar a eliminar desde el índice de la receta cambiada
    for (let i = indexOfOldRecipe + 1; i < this.childs.length; i++) {
      console.log(this.childs[i].ID)
      if (this.childs[i].ID === lastItem) {
        console.log("last item found: ", this.childs[i].ID)
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
    console.log(recipeId)
  }

  getMachineFromRecipe(itemId: number) {

  }

  getRecipeSelection(recipeId: number) {
    console.log(this.dataManagement.recipesFromTreeStructure().find(recipe => recipe.ID === recipeId))
  }

}
