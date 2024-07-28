import { Injectable } from '@angular/core';
import Dexie, { liveQuery, Table } from 'dexie';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, from, Observable } from 'rxjs';
import { AppDB } from './db';
import { Tech } from '../interfaces/mainData/Tech';
import { Recipe } from '../interfaces/mainData/Recipe';
import { Item } from '../interfaces/mainData/Item';
@Injectable({
  providedIn: 'root'
})
export class DataManagementService {
  //to get changes 
  private typesSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public types$: Observable<string[]> = this.typesSubject.asObservable();

  constructor(private db: AppDB,private http: HttpClient) { }
  //from converts promise to observable

  //Common use cases from the db or more complex stuff
  getItems(): Observable<Item[]> {
    return from(this.db.itemsTable.toArray());
  }

  getTechs(): Observable<Tech[]>{
    return from(this.db.techsTable.toArray());
  }
  
  getRecipes(): Observable<Recipe[]>{
    return from(this.db.recipesTable.toArray());
  }

  setTypes(types: string[]){
    this.typesSubject.next(types);
  }

  getTypes(): Observable<string[]>{
    return this.types$;
  }

  isUserFirstTime(): boolean{
    return localStorage.getItem("isFirstTime") === undefined ? true : false;
  }
}
