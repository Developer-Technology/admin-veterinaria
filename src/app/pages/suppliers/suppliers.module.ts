import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SuppliersComponent } from './suppliers.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

@NgModule({
  declarations: [
    SuppliersComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    SuppliersRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class SuppliersModule { }
