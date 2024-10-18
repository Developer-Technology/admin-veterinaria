import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreedsRoutingModule } from './breeds-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BreedsComponent } from './breeds.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    BreedsComponent
  ],
  imports: [
    CommonModule,
    BreedsRoutingModule,
    SharedModule,
    FormsModule,
    ModalModule.forRoot(),
    NgSelectModule
  ]
})
export class BreedsModule { }
