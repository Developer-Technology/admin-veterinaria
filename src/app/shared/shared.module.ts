import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// component
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { DatatableComponent } from './datatable/datatable.component';
import { CustomFieldComponent } from './custom-field/custom-field.component';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    DatatableComponent,
    CustomFieldComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    BreadcrumbsComponent,
    DatatableComponent
  ]
})
export class SharedModule { }