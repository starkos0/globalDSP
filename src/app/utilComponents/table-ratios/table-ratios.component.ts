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
  constructor(public dataManagement: DataManagementService, private db: AppDB, private fb: FormBuilder) {
    effect(() => {
      const items = this.dataManagement.selectedItem(); // Reactively access the signal's value
      
      this.performActionOnSelectedItems(items);
      this.childs = this.dataManagement.childs()
      this.recipesForm = this.dataManagement.recipesForm;
      // this.updateForm(this.childs)
      this.recipesImages = this.dataManagement.recipesImages();
      this.isRecipesFormInitialized = this.dataManagement.isRecipesFormInitialized()

    });
  }
  updateForm(childs: Item[]): void {
    
    this.recipesForm = new FormGroup([])
    // Loop through each child and add a FormControl to the FormGroup if it has more than one recipe
    childs.forEach((child) => {
      if(child.recipes !== undefined){
        if (child.recipes.length > 1 || (child.recipes.length >0 && child.typeString === "Natural Resource")) {
          
          if (!this.recipesForm.contains(child.ID.toString())) {
            this.recipesForm.addControl(child.ID.toString(), new FormControl(null));
          } 
        }
      }
    });

    this.recipesForm.valueChanges.subscribe((values) => {
      console.log(values)
    });
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
  async changeRecipeSelection(itemId: number,recipeId: string) {
    console.log(recipeId)
    console.log(this.recipesForm.value)
    console.log(this.childs.find(item => item.ID === itemId))
    let recipe = await this.db.recipesTable.where('ID').equals(parseInt(recipeId)).toArray();
    console.log(recipe[0])
    if(recipe[0]){
      this.childs = this.childs.filter(item => !recipe[0].Items.includes(item.ID))
      console.log(this.childs)
    }
  }

  getRecipeImage(recipeId: number) {
    let src = ""
    if(this.recipesImages.find(rec => rec.ID === recipeId)){
     src = `assets/${this.recipesImages.find(rec => rec.ID === recipeId)?.IconPath}.png` 
    }
    return src;
  }
  getRecipesItemsSrc(recipeID: number): string[]{
    let recipe = this.dataManagement.imagesRecipes.find(el => el.ID === recipeID);

    if(recipe &&  recipe.items !== undefined){
      return this.dataManagement.imagesRecipes.find(el => el.ID === recipeID)!.items
    }else{
      return []
    }
  }
  getRecipesResultsSrc(recipeID: number): string[]{
    let recipe = this.dataManagement.imagesRecipes.find(el => el.ID === recipeID);

    if(recipe &&  recipe.results !== undefined){
      return this.dataManagement.imagesRecipes.find(el => el.ID === recipeID)!.items
    }else{
      return []
    }
  }
  async makeItOre(item: Item){
    
    let recipe = await this.db.itemsTable.where('name').equals(item.name).toArray();
    
  }
}
