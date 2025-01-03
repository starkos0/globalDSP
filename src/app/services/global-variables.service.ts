import { Injectable } from '@angular/core';
import { Buildings } from '../interfaces/miscTypes/buildings';

@Injectable({
  providedIn: 'root',
})
export class GlobalVariablesService {
  public specialOres: number[] = [1016, 1015, 1014, 1117, 1011, 1116, 1013, 1012, 1003];
  public itemCategories: { [key: number]: string }[] = [
    { 1: 'Resource' },
    { 2: 'Material' },
    { 3: 'Component' },
    { 4: 'Product' },
    { 5: 'Logistics' },
    { 6: 'Production' },
    { 7: '-' },
    { 8: 'Turret' },
    { 9: 'Defense' },
    { 10: 'DarkFog' },
    { 11: 'Matrix' },
  ];

  public initialRatios: { [key: number]: number }[] = [{ 2303: 0.75 }];

  // public buildingsData: Buildings[] = [
  //   {
  //     id: 2303,
  //     details:{
  //       power:360000,
  //       speed:0,
  //       level:1,
  //     }
  //   }
  // ];

  constructor() {}
}
