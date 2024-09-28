import { Component, OnInit, WritableSignal, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { AppDB } from '../../services/db';
import { Recipe } from '../../interfaces/mainData/Recipe';
import { CommonModule } from '@angular/common';

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
      const items = this.dataManagement.selectedItem(); // Reactively access the signal's value

      this.performActionOnSelectedItems(items);
      this.childs = this.dataManagement.childs()
      console.log("CHILDS -> ", this.childs)
      this.recipesForm = this.dataManagement.recipesForm;
      this.recipesImages = this.dataManagement.recipesImages();
      this.isRecipesFormInitialized = this.dataManagement.isRecipesFormInitialized()

      // //this part right here is just to know which recipe was selected before the user changes it, so i can delete the exact current items from the previous recipe and put the new ones
      // //to add the new ones i thought this: i count exactly how many items are used in the previous recipe, i find the exact location of the item, i remove the next X items and then just in the same
      // //position i add the new ones
      // this.previousFormValues = { ...this.recipesForm.value };

      // this.recipesForm.valueChanges.subscribe(newFormValues => {
      //   console.log('Valor anterior del formulario:', this.previousFormValues); 
      //   console.log('Nuevo valor del formulario:', newFormValues); 
      //   this.previousFormValues = { ...newFormValues };
      // });
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
  async changeRecipeSelection(itemId: number, recipeId: string) {
    // console.log(recipeId)
    // console.log(this.recipesForm.value)
    // console.log(this.childs.find(item => item.ID === itemId))
    // let recipe = await this.db.recipesTable.where('ID').equals(parseInt(recipeId)).toArray();
    // console.log(recipe[0])
    // if (recipe[0]) {
    //   this.childs = this.childs.filter(item => !recipe[0].Items.includes(item.ID))
    //   console.log(this.childs)
    // }
    console.log('Valor del formulario después del cambio (change):', this.recipesForm.value);
    console.log('Valor anterior del formulario:', this.previousFormValues);
    for (let key in this.recipesForm.value) {
      const changedRecipe: { [key: string]: number } = {};
      const oldRecipe: { [key: string]: number } = {};
      if (this.recipesForm.value[key] !== this.previousFormValues[key]) {
        changedRecipe[key] = this.recipesForm.value[key]
        oldRecipe[key] = this.previousFormValues[key]
        console.log("this is the new recipe ", changedRecipe)
        console.log("this is the old recipe: ", oldRecipe)
        this.removeCurrentRecipe(oldRecipe)
      }
    }
    // let previousRecipe = await this.db.itemsTable.where('name').equals(this.previousFormValues.).toArray();

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
      if(itemId === 1104){
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
}
