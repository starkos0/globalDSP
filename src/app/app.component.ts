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
  public typeStrings: string[] = [];
  constructor(private db: AppDB, private dataManagement: DataManagementService, private http: HttpClient){}

  async ngOnInit() {
    await this.db.checkFirstTimeAndLoadData();
    // this.comprobarLista();
    // this.comprobarRecipes();
    // this.comprobarLista();
    // this.getAllAssembling();
    // this.getItemType();
    // this.getItemTypeString();

    // const types$ = this.dataManagement.getItemTypes();
    // types$.subscribe({
    //   next: (data) =>{
    //     console.log(data)
    //   }
    // })
    const itemTypeStrings$ = this.dataManagement.getItemTypeString();
    itemTypeStrings$.subscribe({
      next: (data) =>{
        console.log(data)
        this.typeStrings = data;
       
      }
    })
    // this.dataManagement.getAllAssemblingMachines('Smelting Facility').subscribe({
    //   next: (data) =>{
    //     data.forEach(element => {
    //       console.log(element.prefabDesc.assemblerSpeed / this.dataManagement.machinesSpeedRatio)
    //     });
    //   }
    // })
    // this.dataManagement.getAllAssemblingMachines('Assembler').subscribe({
    //   next: (data) =>{
    //     data.forEach(element => {
    //       console.log(element.prefabDesc.assemblerSpeed / this.dataManagement.machinesSpeedRatio)
    //     });
    //   }
    // })
    // this.dataManagement.getAllMadeFromStringRecipes().subscribe({
    //   next: (data) =>{
    //     console.log(data)
    //   }
    // })


  }

  createRecipeTree(){
    //
  }

  comprobarTechs(){
    this.dataManagement.getTechs().subscribe({
      next: (data) => {
        console.log(data)
        this.techs = data;
      }
    })
  }

  comprobarLista(){
    this.dataManagement.getItems().subscribe({
      next: (data) =>{
        console.log(data)
        this.dataTest = data;
      }
    })
  }
  comprobarRecipes(){
    this.dataManagement.getRecipes().subscribe({
      next: (data) =>{
        console.log(data)
        this.recipes = data;
      }
    })
  }

  getItemType(){
    this.dataManagement.getItemTypes().subscribe({
      next: (data) => {
        console.log(data)
      }
    })
  }
  getItemTypeString(){
    this.dataManagement.getItemTypeString().subscribe({
      next: (data) =>{
        console.log(data)
      }
    })
  }
}
