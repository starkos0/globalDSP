import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  showAlert = false;

  showTemporaryAlert() {
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 3000); // Oculta el alert después de 3 segundos
  }
}
