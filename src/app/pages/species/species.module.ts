import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpeciesRoutingModule } from './species-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SpeciesComponent } from './species.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [
    SpeciesComponent
  ],
  imports: [
    CommonModule,
    SpeciesRoutingModule,
    SharedModule,
    FormsModule,
    ModalModule.forRoot(),
  ]
})
export class SpeciesModule { }