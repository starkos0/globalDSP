import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataManagementService } from './services/data-management.service';
import { AppDB } from './services/db';
import { Observable } from 'rxjs';
import { Tech } from './interfaces/mainData/Tech';
import { Recipe } from './interfaces/mainData/Recipe';
import { Item } from './interfaces/mainData/Item';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'globalDSP';
  public dataTest: Item[] = [];
  public techs: Tech[] = [];
  public recipes: Recipe[] = [];
  constructor(private db: AppDB, private dataManagement: DataManagementService, private http: HttpClient){}

  async ngOnInit() {
    await this.db.checkFirstTimeAndLoadData();
    // this.comprobarLista();
    this.comprobarRecipes();
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
}
