import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { HistoriesRoutingModule } from './histories-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HistoriesComponent } from './histories.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
// Mask
import { provideNgxMask } from 'ngx-mask';
// Dropzone
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
   url: 'https://httpbin.org/post',
   maxFilesize: 50,
   acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [
    HistoriesComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    HistoriesRoutingModule,
    SharedModule,
    FormsModule,
    DropzoneModule,
    FlatpickrModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideNgxMask(),
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ]
})
export class HistoriesModule { }
