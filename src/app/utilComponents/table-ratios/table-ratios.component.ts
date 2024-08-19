import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataManagementService } from '../../services/data-management.service';

@Component({
  selector: 'app-table-ratios',
  standalone: true,
  imports: [],
  templateUrl: './table-ratios.component.html',
  styleUrl: './table-ratios.component.scss'
})
export class TableRatiosComponent implements OnInit{
  // public itemsSelected = input.required<Item[]>(); 
  public globalSettingsForm!: FormGroup;
  constructor(public dataManagement: DataManagementService){
  }
  ngOnInit(): void {
    this.globalSettingsForm = this.dataManagement.globalSettingsForm;
    this.globalSettingsForm.valueChanges.subscribe(values => {
      // console.log(values)
    })
  }

}
