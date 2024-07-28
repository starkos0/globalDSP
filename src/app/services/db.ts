import Dexie, { Table } from "dexie";
import { DataManagementService } from "./data-management.service";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Recipe } from "../interfaces/mainData/Recipe";
import { Tech } from "../interfaces/mainData/Tech";
import { Item } from "../interfaces/mainData/Item";

@Injectable({
    providedIn: 'root',
  })
export class AppDB extends Dexie {
    public itemsTable!: Table<Item, number>;
    public recipesTable!: Table<Recipe, number>;
    public techsTable!: Table<Tech, number>;

    constructor(private http: HttpClient) {
        super('dspData');

        this.version(1).stores({
            itemsTable: 'ID',
            recipesTable: 'ID',
            techsTable: 'ID',
        });
        this.itemsTable = this.table('itemsTable');
        this.recipesTable = this.table('recipesTable');
        this.techsTable = this.table('techsTable');
    }
   
    private async populate() {
        try {
            const [items, recipes, techs] = await Promise.all([
                this.loadDataFromJSON<Item[]>('/assets/dspDataJson/ItemProtoSet.json'),
                this.loadDataFromJSON<Recipe[]>('/assets/dspDataJson/RecipeProtoSet.json'),
                this.loadDataFromJSON<Tech[]>('/assets/dspDataJson/TechProtoSet.json')
            ]);
    
            await this.transaction('rw', this.itemsTable, this.recipesTable, this.techsTable, async () => {
                await Promise.all([
                    this.itemsTable.bulkAdd(items),
                    this.recipesTable.bulkAdd(recipes),
                    this.techsTable.bulkAdd(techs)
                ]);
            });
    
            console.log('Data populated successfully');
        } catch (err) {
            console.error('Error populating data:', err);
        } finally {
            console.log("all good");
        }
    }

    private async loadDataFromJSON<T>(url: string): Promise<T> {
        return await firstValueFrom(this.http.get<T>(url));
    }

    public async checkFirstTimeAndLoadData() {
        const isFirstTime = localStorage.getItem("isFirstTime");
        console.log(isFirstTime)

        if (!isFirstTime) {
            await this.populate();
            localStorage.setItem('isFirstTime', 'false');
        }
    }
}