import { Component } from '@angular/core';
import { HeaderComponent } from "./pages/header/header.component";

@Component({
  selector: 'app-root',
  imports: [HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: '../styles.scss'
})
export class AppComponent {
  title = 'search-music'
}
