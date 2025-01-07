import { Component, effect, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../utilComponents/navbar/navbar.component';
import { AppDB } from '../../services/db';
import { DataManagementService } from '../../services/data-management.service';
import { Item } from '../../interfaces/mainData/Item';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Recipe } from '../../interfaces/mainData/Recipe';
import { CommonModule } from '@angular/common';
import { TableRatiosComponent } from '../../utilComponents/table-ratios/table-ratios.component';
import { GlobalSettingsServiceService } from '../../services/global-settings-service.service';
import { GlobalSettingsFormValues } from '../../interfaces/mainData/global-settings-form-values';
@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, FormsModule, ReactiveFormsModule, CommonModule, TableRatiosComponent],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent implements OnInit {
  @ViewChild('myModal') myModal!: ElementRef;

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
      name: '',
    },
    maincraft: {
      ID: 0,
      name: '',
    },
    handcraftProductCount: 0,
    maincraftProductCount: 0,
    handcrafts: [],
    recipes: [],
    makes: [],
    rawMats: [],
    preTech: {
      ID: 0,
      name: '',
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
          y: 0,
        },
        ext: {},
        q: {
          w: 0,
        },
        shape: '',
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
        y: 0,
      },
      blueprintBoxSize: {
        x: 0,
        y: 0,
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
        y: 0,
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
      audioDoppler: 0,
      minerPeriod: 0,
      labAssembleSpeed: 0,
      beltSpeed: 0,
    },
    ID: 0,
    description: '',
    index: 0,
    iconSprite: '',
    canUpgrade: false,
    typeString: '',
    fuelTypeString: '',
    name: '',
    isRaw: false,
  };
  public userInitialAmount: number = 0;
  public typeStrings: string[] = [];
  public machines: Item[][] = [];

  public assemblerSelectOptions: Item[] = [];
  public smeltingSelectOptions: Item[] = [];
  public miningSelectOptions: Item[] = [];
  public chemicalSelectOptions: Item[] = [];
  public researchSelectOptions: Item[] = [];
  public proliferationSelectOptions: Item[] = [];
  public beltSelectOptions: Item[] = [];
  public selectedRecipes: Item[][] = [];
  public recipes: Recipe[] = [];
  public items: Item[] = [];
  public resourcesMaterialsProducts: Item[] = [];
  public buildings: Item[] = [];

  constructor(
    public dataManagement: DataManagementService,
    public globalSettingsService: GlobalSettingsServiceService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.dataManagement.preloadData();

    const machineOptions$ = this.dataManagement.getItemTypeString().pipe(
      switchMap((data) => {
        return forkJoin(
          data.map((item: { typeString: string; IconPath: string }) =>
            this.dataManagement.getAllMachinesByType(item.typeString).pipe(
              map((res) => {
                console.log(item.typeString);
                switch (item.typeString) {
                  case 'Assembler':
                    this.assemblerSelectOptions = res;
                    this.globalSettingsService.setPropertyWithLocalStorage('assemblerSelect', this.assemblerSelectOptions, 'savedAssemblerID');
                    break;

                  case 'Mining Facility':
                    this.miningSelectOptions = res;
                    this.globalSettingsService.setPropertyWithLocalStorage('miningSelect', this.miningSelectOptions, 'savedMiningMachineID');
                    break;

                  case 'Smelting Facility':
                    this.smeltingSelectOptions = res;
                    this.globalSettingsService.setPropertyWithLocalStorage('smeltingSelect', this.smeltingSelectOptions, 'savedSmelterID');
                    break;

                  case 'Research Facility':
                    this.researchSelectOptions = res;
                    this.globalSettingsService.setPropertyWithLocalStorage('researchSelect', this.researchSelectOptions, 'savedMatrixLabID');
                    break;

                  case 'Chemical Facility':
                    this.chemicalSelectOptions = res;
                    this.globalSettingsService.setPropertyWithLocalStorage('chemicalSelect', this.chemicalSelectOptions, 'savedChemicalPlantID');
                    break;

                  default:
                    break;
                }
                return { typeString: item.typeString, res };
              })
            )
          )
        );
      })
    );

    const proliferatorOptions$ = this.dataManagement.getProliferatorItems().pipe(
      tap((proliferatorData) => {
        this.proliferationSelectOptions = proliferatorData;
        this.globalSettingsService.setPropertyWithLocalStorage('proliferationSelect', this.proliferationSelectOptions, 'savedProliferatorID');
      })
    );

    const beltOptions$ = this.dataManagement.getBeltItems().pipe(
      tap((beltData) => {
        this.beltSelectOptions = beltData;
        console.log(this.beltSelectOptions);
        this.globalSettingsService.setPropertyWithLocalStorage('beltSelect', this.beltSelectOptions, 'savedBeltID');
      })
    );

    const recipes$ = this.dataManagement.getRecipes();
    const items$ = this.dataManagement.getItems();

    // Combinar todas las llamadas con `forkJoin`
    forkJoin([machineOptions$, proliferatorOptions$, items$, recipes$, beltOptions$]).subscribe({
      next: ([machineData, proliferatorData, items, recipes]) => {
        this.items = items;
        this.recipes = recipes;

        this.resourcesMaterialsProducts = this.items.filter(
          (item) =>
            item.Type === 'Resource' ||
            item.Type === 'Material' ||
            item.Type === 'Product' ||
            item.Type === 'Component' ||
            item.Type === 'Matrix' ||
            item.Type === 'DarkFog'
        );

        this.buildings = this.items
          .filter(
            (item) =>
              !(
                item.Type === 'Resource' ||
                item.Type === 'Material' ||
                item.Type === 'Product' ||
                item.Type === 'Component' ||
                item.Type === 'Matrix' ||
                item.Type === 'DarkFog'
              )
          )
          .sort((a, b) => a.ID - b.ID);
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }

  selectAssembler(item: Item) {
    this.globalSettingsService.updateProperty('assemblerSelect', item);
    localStorage.setItem('savedAssemblerID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['Assembler'] = item.IconPath;
  }

  selectSmelter(item: Item) {
    this.globalSettingsService.updateProperty('smeltingSelect', item);
    localStorage.setItem('savedSmelterID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['Smelting Facility'] = item.IconPath;
  }

  selectMiningMachine(item: Item) {
    this.globalSettingsService.updateProperty('miningSelect', item);
    localStorage.setItem('savedMiningMachineID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['Mining Facility'] = item.IconPath;
  }

  selectMatrixLab(item: Item) {
    this.globalSettingsService.updateProperty('researchSelect', item);
    localStorage.setItem('savedMatrixLabID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['Research Facility'] = item.IconPath;
  }

  selectChemicalPlant(item: Item) {
    this.globalSettingsService.updateProperty('chemicalSelect', item);
    localStorage.setItem('savedChemicalPlantID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['Chemical Facility'] = item.IconPath;
  }

  selectProliferator(item: Item) {
    this.globalSettingsService.updateProperty('proliferationSelect', item);
    localStorage.setItem('savedProliferatorID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['proliferator'] = item.IconPath;
  }

  selectBelt(item: Item) {
    this.globalSettingsService.updateProperty('beltSelect', item);
    localStorage.setItem('savedBeltID', item.ID.toString());

    this.dataManagement.powerFacilitiesMap()['belt'] = item.IconPath;
  }

  getImageSrc(itemName: string): string {
    let src: string = '';
    let item: Item | undefined;

    if (itemName.includes('(advanced)')) {
      item = this.items.find((item) => item.name === itemName.split('(')[0].slice(0, -1));
    } else {
      item = this.items.find((item) => item.name === itemName);
    }

    if (item !== undefined) {
      src = item.IconPath;
    } else {
      src = 'Icons/ItemRecipe/various/warning-signal-round';
    }

    return src;
  }
}
