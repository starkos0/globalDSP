import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../utilComponents/navbar/navbar.component';

@Component({
  selector: 'app-quick-ratios',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent],
  templateUrl: './quick-ratios.component.html',
  styleUrl: './quick-ratios.component.scss',
})
export class QuickRatiosComponent {}
