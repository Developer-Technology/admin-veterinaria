import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// component
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { DatatableComponent } from './datatable/datatable.component';
import { CustomFieldComponent } from './custom-field/custom-field.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import lottie from 'lottie-web';
import { defineElement } from "@lordicon/element";

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    DatatableComponent,
    CustomFieldComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    BreadcrumbsComponent,
    DatatableComponent
  ]
})
export class SharedModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}