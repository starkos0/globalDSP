import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataManagementService } from './services/data-management.service';
import { AppDB } from './services/db';
import { from, Observable, toArray } from 'rxjs';
import { Tech } from './interfaces/mainData/Tech';
import { Recipe } from './interfaces/mainData/Recipe';
import { Item } from './interfaces/mainData/Item';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'globalDSP';
  public dataTest: Item[] = [];
  public techs: Tech[] = [];
  public recipes: Recipe[] = [];
  public types: string[] = [];
  public typeStrings: { typeString: string; IconPath: string }[] = [];
  constructor(private db: AppDB, private dataManagement: DataManagementService, private http: HttpClient){}

  async ngOnInit() {
    await this.db.checkFirstTimeAndLoadData();

    const itemTypeStrings$ = this.dataManagement.getItemTypeString();
    itemTypeStrings$.subscribe({
      next: (data) =>{
        
        this.typeStrings = data;
        
       
      }
    })
    const madeFromStrings$ = this.dataManagement.getMadeFromString();
    madeFromStrings$.subscribe({
      next: (data) =>{
        
        
      }
    })  

  }

  createRecipeTree(){
    //
  }

  comprobarTechs(){
    this.dataManagement.getTechs().subscribe({
      next: (data) => {
        
        this.techs = data;
      }
    })
  }

  comprobarLista(){
    this.dataManagement.getItems().subscribe({
      next: (data) =>{
        
        this.dataTest = data;
      }
    })
  }
  comprobarRecipes(){
    this.dataManagement.getRecipes().subscribe({
      next: (data) =>{
        
        this.recipes = data;
      }
    })
  }

}
