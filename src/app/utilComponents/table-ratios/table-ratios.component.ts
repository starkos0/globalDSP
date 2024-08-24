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
  public formTest!: FormGroup;
  public childs: Item[] = []
  constructor(public dataManagement: DataManagementService, private db: AppDB, private fb: FormBuilder) {
    effect(() => {
      const items = this.dataManagement.selectedItem(); // Reactively access the signal's value
      console.log('Selected items updated in ComponentB:', items);
      this.performActionOnSelectedItems(items);
      this.childs = this.dataManagement.childs()
      console.log("CHILDS IN EFFECT", this.childs)
      this.updateForm(this.childs)
    });
  }
  updateForm(childs: Item[]): void {
    console.log("Updating form with new child items");
    this.recipesForm = new FormGroup([])
    console.log(childs.length)
    // Loop through each child and add a FormControl to the FormGroup if it has more than one recipe
    childs.forEach((child) => {
      if(child.recipes !== undefined){
        if (child.recipes.length > 1) {
          console.log("recipeeeeeeeeeeee ", child.ID)
          if (this.recipesForm.contains(child.ID.toString())) {
            console.log(`FormControl for child ${child.ID} already exists.`);
          } else {
            this.recipesForm.addControl(child.ID.toString(), new FormControl(null));
          }
        }
      }
    });

    console.log(this.recipesForm)
    this.recipesForm.valueChanges.subscribe((values) => {
      console.log('Form values changed:', values);
    });
  }
  ngOnInit(): void {
    this.globalSettingsForm = this.dataManagement.globalSettingsForm;
    this.globalSettingsForm.valueChanges.subscribe(values => {
      // console.log(values)
    })
    this.recipesForm = this.fb.group({});
    this.recipesForm.valueChanges.subscribe(values => {
      console.log(values)
    })
    const group2: any = {}
    group2['1121'] = new FormControl(null);
    this.formTest = this.fb.group(group2)
    console.log("FORM TEST, ", this.formTest)
    // childs.forEach((child) => {
    //   if (child.recipes.length > 1) {
    //     console.log("RECIPE ID ",child.ID.toString())
    //     // Each child with more than one recipe gets a FormControl
    //     group[child.ID.toString()] = new FormControl(null); // Control name based on child ID
    //   }
    // });

    // // Set the newly created form group
    // this.recipesForm = this.fb.group(group);
  }
  performActionOnSelectedItems(newItems: Item[]): void {
    // Logic to perform action on updated items
    console.log('Performing action on updated items:', newItems);
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
  changeRecipeSelection(recipeId: string) {
    // console.log("changerecipeselection: ", recipeId)
    console.log(this.recipesForm.get(recipeId))
    // console.log("radio button value: ",this.recipesForm.get(recipeId.toString())?.value)
  }
  changeRecipeSelection2(event: Event) {
    console.log("changerecipeselection: ", event)
    // console.log("radio button value: ",this.recipesForm.get(recipeId.toString())?.value)
  }
}
