import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'powerConversion',
  standalone: true
})
export class PowerConversionPipe implements PipeTransform {

  transform(value: number): string {
    if(value === null  || value === undefined){
      return 'No power';
    }

    const units = ['W','kW', 'MW', 'GW', 'TW'];
    let unitIndex = 0;
    
    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }

}
