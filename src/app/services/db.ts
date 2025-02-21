import Dexie, { Table } from 'dexie';
import { DataManagementService } from './data-management.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Recipe } from '../interfaces/mainData/Recipe';
import { Tech } from '../interfaces/mainData/Tech';
import { Item } from '../interfaces/mainData/Item';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AppDB extends Dexie {
  public itemsTable!: Table<Item, number>;
  public recipesTable!: Table<Recipe, number>;
  public techsTable!: Table<Tech, number>;

  constructor(
    private http: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {
    super('dspData');

    this.version(5).stores({
      itemsTable: 'ID,typeString,name,Type',
      recipesTable: 'ID,name,Results',
      techsTable: 'ID',
    });
    this.itemsTable = this.table('itemsTable');
    this.recipesTable = this.table('recipesTable');
    this.techsTable = this.table('techsTable');
  }

  private async populate() {
    try {
      const [items, recipes, techs] = await Promise.all([
        this.loadDataFromJSON<Item[]>(`${this.baseHref}assets/dspDataJson/ItemProtoSet.json`),
        this.loadDataFromJSON<Recipe[]>(`${this.baseHref}assets/dspDataJson/RecipeProtoSet.json`),
        this.loadDataFromJSON<Tech[]>(`${this.baseHref}assets/dspDataJson/TechProtoSet.json`),
      ]);

      await this.transaction('rw', this.itemsTable, this.recipesTable, this.techsTable, async () => {
        await Promise.all([this.itemsTable.bulkAdd(items), this.recipesTable.bulkAdd(recipes), this.techsTable.bulkAdd(techs)]);
      });
    } catch (err) {
      
    } finally {
    }
  }

  private async loadDataFromJSON<T>(url: string): Promise<T> {
    return await firstValueFrom(this.http.get<T>(url));
  }

  public async checkFirstTimeAndLoadData() {
    const isFirstTime = localStorage.getItem('isFirstTime');

    if (!isFirstTime) {
      await this.populate();
      localStorage.setItem('isFirstTime', 'false');
    }
  }
}
