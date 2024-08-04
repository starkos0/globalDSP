import { Routes } from '@angular/router';
import { CalculatorComponent } from './mainComponents/calculator/calculator.component';
import { QuickRatiosComponent } from './mainComponents/quick-ratios/quick-ratios.component';
import { HomeComponent } from './mainComponents/home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {path: 'calculator', component: CalculatorComponent},
    {path: 'quickRatios', component: QuickRatiosComponent},
];
