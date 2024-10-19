import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetsComponent } from './pets.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { PetsRoutingModule } from './pets-routing.module';
import { ViewComponent } from './view/view.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FlatpickrModule } from 'angularx-flatpickr';

@NgModule({
  declarations: [
    PetsComponent,
    AddComponent,
    EditComponent,
    ViewComponent
  ],
  imports: [
    CommonModule,
    PetsRoutingModule,
    FormsModule,
    NgSelectModule,
    AngularCropperjsModule,
    SharedModule,
    ModalModule,
    FlatpickrModule.forRoot(),
  ]
})
export class PetsModule { }
