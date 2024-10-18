import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VaccinesRoutingModule } from './vaccines-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { VaccinesComponent } from './vaccines.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    VaccinesComponent
  ],
  imports: [
    CommonModule,
    VaccinesRoutingModule,
    SharedModule,
    FormsModule,
    ModalModule.forRoot(),
    NgSelectModule
  ]
})
export class VaccinesModule { }
