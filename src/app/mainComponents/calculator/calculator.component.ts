import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../utilComponents/navbar/navbar.component';
import { AppDB } from '../../services/db';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { forkJoin, map, mergeMap, switchMap, tap } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent implements OnInit {
  public globalSettingsForm: FormGroup;

  public userInitialAmount: number = 0;
  public typeStrings: string[] = [];
  public machines: Item[][] = [];

  public assemblerSelectOptions: Item[] = [];
  public smelterSelectOptions: Item[] = [];
  public miningMachineSelectOptions: Item[] = [];
  public chemicalPlantSelectOptions: Item[] = [];
  public matrixLabSelectOptions: Item[] = [];


  constructor(private db: AppDB, private dataManagement: DataManagementService) {
    this.globalSettingsForm = new FormGroup(
      {
        initialAmountValue: new FormControl(0, []),
        unitSelected: new FormControl('m', []),
        assemblerSelect: new FormControl(null,[])
      }
    );
    this.globalSettingsForm.valueChanges.subscribe(values => {
      this.optionsChanged(values)
    })
  }
  optionsChanged(values: any) {
    console.log(values)
  }
  ngOnInit(): void {
    this.dataManagement.getItemTypeString().pipe(
      switchMap(data => {
        return forkJoin(
          data.map((str: string) =>
            this.dataManagement.getAllMachinesByType(str).pipe(
              map(res => {
                switch (str) {
                  case 'Assembler':
                    this.assemblerSelectOptions = res;
                    break;
                  case 'Mining Facility':
                    this.miningMachineSelectOptions = res;
                    break;
                  case 'Smelting Facility':
                    this.smelterSelectOptions = res;
                    break;
                  case 'Research Facility':
                    this.matrixLabSelectOptions = res;
                    break;
                  case 'Chemical Facility':
                    this.chemicalPlantSelectOptions = res;
                    break;
                  default:
                    break;
                }
                return {str, res};
              })
            )
          )
        );
      })
    ).subscribe({
      next: data => {
        console.log(data);
        console.log(this.assemblerSelectOptions);
        console.log(this.miningMachineSelectOptions);
        console.log(this.smelterSelectOptions);
        console.log(this.matrixLabSelectOptions);
        console.log(this.chemicalPlantSelectOptions);
        this.globalSettingsForm.get('assemblerSelect')?.setValue(this.assemblerSelectOptions[0]);
      },
      error: err => {
        console.error('Error:', err);
      }
    });
  }
  initialAmountChanged() {
    console.log(this.userInitialAmount)
  }
  selectAssembler(item: Item){
    this.globalSettingsForm.get('assemblerSelect')?.setValue(item)
    console.log(this.globalSettingsForm.get('assemblerSelect')?.value)
  }
}
