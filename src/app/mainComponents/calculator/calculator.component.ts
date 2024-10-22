import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../utilComponents/navbar/navbar.component';
import { AppDB } from '../../services/db';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { forkJoin, map, switchMap } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Recipe } from '../../interfaces/mainData/Recipe';
import { CommonModule } from '@angular/common';
import { TableRatiosComponent } from "../../utilComponents/table-ratios/table-ratios.component";
@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, FormsModule, ReactiveFormsModule, CommonModule, TableRatiosComponent],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent implements OnInit {
  @ViewChild('myModal') myModal!: ElementRef;
  public globalSettingsForm: FormGroup;
  public defaultItem: Item = {
    Type: '',
    StackSize: 0,
    Grade: 0,
    Upgrades: [],
    IsEntity: false,
    CanBuild: false,
    IconPath: '',
    ModelIndex: 0,
    ModelCount: 0,
    HpMax: 0,
    BuildIndex: 0,
    BuildMode: 0,
    GridIndex: 0,
    DescFields: [],
    handcraft: {
      ID: 0,
      name: ''
    },
    maincraft: {
      ID: 0,
      name: ''
    },
    handcraftProductCount: 0,
    maincraftProductCount: 0,
    handcrafts: [],
    recipes: [],
    makes: [],
    rawMats: [],
    preTech: {
      ID: 0,
      name: ''
    },
    prefabDesc: {
      modelIndex: 0,
      hasObject: false,
      lodCount: 0,
      lodDistances: [],
      startInstCapacity: 0,
      batchCapacity: 0,
      cullingHeight: 0,
      castShadow: 0,
      recvShadow: 0,
      colliders: [],
      hasBuildCollider: false,
      buildCollider: {
        idType: 0,
        pos: {
          y: 0
        },
        ext: {},
        q: {
          w: 0
        },
        shape: ''
      },
      buildColliders: [],
      roughRadius: 0,
      roughHeight: 0,
      roughWidth: 0,
      colliderComplexity: 0,
      barWidth: 0,
      barHeight: 0,
      landPoints: [],
      dragBuild: false,
      dragBuildDist: {
        x: 0,
        y: 0
      },
      blueprintBoxSize: {
        x: 0,
        y: 0
      },
      isAssembler: false,
      assemblerSpeed: 0,
      assemblerRecipeType: '',
      anim_working_length: 0,
      isPowerConsumer: false,
      workEnergyPerTick: 0,
      idleEnergyPerTick: 0,
      minimapType: 0,
      slotPoses: [],
      selectCenter: {
        y: 0
      },
      selectSize: {},
      selectAlpha: 0,
      selectDistance: 0,
      signHeight: 0,
      signSize: 0,
      audioProtoId0: 0,
      audioRadius0: 0,
      audioRadius1: 0,
      audioFalloff: 0,
      audioVolume: 0,
      audioPitch: 0,
      audioDoppler: 0
    },
    ID: 0,
    description: '',
    index: 0,
    iconSprite: '',
    canUpgrade: false,
    typeString: '',
    fuelTypeString: '',
    name: ''
  }
  public userInitialAmount: number = 0;
  public typeStrings: string[] = [];
  public machines: Item[][] = [];

  public assemblerSelectOptions: Item[] = [];
  public smelterSelectOptions: Item[] = [];
  public miningMachineSelectOptions: Item[] = [];
  public chemicalPlantSelectOptions: Item[] = [];
  public matrixLabSelectOptions: Item[] = [];
  public selectedRecipes: Item[][] = [];
  public recipes: Recipe[] = [];
  public items: Item[] = [];
  public resourcesMaterialsProducts: Item[] = [];
  public buildings: Item[] = [];

  constructor(private db: AppDB, public dataManagement: DataManagementService) {
    this.globalSettingsForm = new FormGroup(
      {
        initialAmountValue: new FormControl(0, []),
        unitSelected: new FormControl('m', []),
        assemblerSelect: new FormControl(this.defaultItem, []),
        smelterSelect: new FormControl(this.defaultItem, []),
        miningMachineSelect: new FormControl(this.defaultItem, []),
        matrixLabSelect: new FormControl(this.defaultItem, []),
        chemicalPlantSelect: new FormControl(this.defaultItem, [])
      }
    );
    this.dataManagement.setGlobalSettingsForm(this.globalSettingsForm);

    this.globalSettingsForm.valueChanges.subscribe(values => {
      this.optionsChanged(values)
    })
  }
  optionsChanged(values: any) {
    // console.log(values)
    // console.log(Object.keys(this.globalSettingsForm.controls))
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
                    this.setFormControlWithLocalStorage('assemblerSelect',this.assemblerSelectOptions,'savedAssemblerID');
                    break;

                  case 'Mining Facility':
                    this.miningMachineSelectOptions = res;
                    this.setFormControlWithLocalStorage('miningMachineSelect',this.miningMachineSelectOptions,'savedMiningMachineID');
                    break;

                  case 'Smelting Facility':
                    this.smelterSelectOptions = res;
                    this.setFormControlWithLocalStorage('smelterSelect',this.smelterSelectOptions,'savedSmelterID');
                    break;

                  case 'Research Facility':
                    this.matrixLabSelectOptions = res;
                    this.setFormControlWithLocalStorage('matrixLabSelect',this.matrixLabSelectOptions,'savedMatrixLabID');
                    break;

                  case 'Chemical Facility':
                    this.chemicalPlantSelectOptions = res;
                    this.setFormControlWithLocalStorage('chemicalPlantSelect',this.chemicalPlantSelectOptions,'savedChemicalPlantID');
                    break;

                  default:
                    break;
                }
                return { str, res };
              })
            )
          )
        );
      })
    ).subscribe({
      next: data => {
        console.log(data);
      },
      error: err => {
        console.error('Error:', err);
      }
    });

    const recipes$ = this.dataManagement.getRecipes();
    const items$ = this.dataManagement.getItems();
    forkJoin([items$, recipes$]).subscribe({
      next: (res) => {
        this.items = res[0];
        this.recipes = res[1];
        this.resourcesMaterialsProducts = this.items.filter(item => item.Type === "Resource" || item.Type === "Material" || item.Type === "Product" || item.Type === "Component" || item.Type === "Matrix" || item.Type === "DarkFog");
        this.buildings = this.items.filter(item => !(item.Type === "Resource" || item.Type === "Material" || item.Type === "Product" || item.Type === "Component" || item.Type === "Matrix" || item.Type === "DarkFog")).sort((a, b) => a.ID - b.ID);
      }
    })

  }
  initialAmountChanged() {
    console.log(this.userInitialAmount)
  }
  selectAssembler(item: Item) {
    this.globalSettingsForm.get('assemblerSelect')?.setValue(item)
    console.log(this.globalSettingsForm)
    console.log(this.globalSettingsForm.get('assemblerSelect')?.value)
    localStorage.setItem('savedAssemblerID', item.ID.toString());
  }
  selectSmelter(item: Item) {
    this.globalSettingsForm.get('smelterSelect')?.setValue(item);
    console.log(this.globalSettingsForm.get('smelterSelect')?.value);
    localStorage.setItem('savedSmelterID', item.ID.toString());
  }
  selectMiningMachine(item: Item) {
    this.globalSettingsForm.get('miningMachineSelect')?.setValue(item)
    console.log(this.globalSettingsForm.get('miningMachineSelect')?.value)
    localStorage.setItem('savedMiningMachineID', item.ID.toString());
  }
  selectMatrixLab(item: Item) {
    this.globalSettingsForm.get('matrixLabSelect')?.setValue(item)
    console.log(this.globalSettingsForm.get('matrixLabSelect')?.value)
    localStorage.setItem('savedMatrixLabID', item.ID.toString());
  }
  selectChemicalPlant(item: Item) {
    this.globalSettingsForm.get('chemicalPlantSelect')?.setValue(item)
    console.log(this.globalSettingsForm.get('chemicalPlantSelect')?.value)
    localStorage.setItem('savedChemicalPlantID', item.ID.toString());
  }
  getImageSrc(itemName: string): string {
    let src: string = "";
    let item: Item | undefined;

    if (itemName.includes("(advanced)")) {
      item = this.items.find(item => item.name === itemName.split("(")[0].slice(0, -1));
    } else {
      item = this.items.find(item => item.name === itemName);
    }

    if (item !== undefined) {
      src = item.IconPath;
    } else {
      // console.log(itemName);
      src = "Icons/ItemRecipe/various/warning-signal-round";
    }

    return src;
  }

  // getBuildingSrcById(): string{
  //   let src = "";

  //   this.dataManagement.getItemById(buildingId).subscribe(data =>{
  //     if(data){
  //       src = `assets/${data[0].IconPath}.png` 
  //     }
  //   })
  //   return src;
  // }

  setFormControlWithLocalStorage(controlName: string, options: Item[], localStorageKey: string) {
    const savedID = localStorage.getItem(localStorageKey);
    // console.log(savedID)
    if (savedID) {
      const selectedItem = options.find(item => item.ID === parseInt(savedID, 10));
      if (selectedItem) {
        this.globalSettingsForm.get(controlName)?.setValue(selectedItem);
      } else {
        this.globalSettingsForm.get(controlName)?.setValue(options[0]);
      }
    } else {
      this.globalSettingsForm.get(controlName)?.setValue(options[0]);
    }
  }


}
