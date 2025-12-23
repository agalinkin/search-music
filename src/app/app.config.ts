import { NgModule } from '@angular/core';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
}

@NgModule({
  imports: [
    AppComponent,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes) // ВАЖНО!
  ],
  providers: [],  
})
export class AppModule { }