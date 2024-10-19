import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild('cropper', { static: false }) cropper: any;
  breadCrumbItems!: Array<{}>;
  modalRef?: BsModalRef;
  editCompany: any = {
    companyDoc: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyPhoto: '',
    companyCurrency: '',
    companyTax: '',
  };

  //company: any = null;
  errors: any = {};
  imageUrl: string = 'assets/images/default/40084.png';
  croppedImage: string | ArrayBuffer | null = ''; // Almacena la imagen recortada en base64
  serverUrl: string;
  isLoading: boolean = true;
  isLoadingBtn: boolean = false;

  config = {
    aspectRatio: 400 / 84,  // Relación de aspecto 4.76 para un recorte de 400x84
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 1,  // Asegura que el área de recorte ocupe el espacio completo al cargar
    viewMode: 1,  // Asegura que el recorte permanezca dentro de los límites de la imagen
    cropBoxResizable: true,  // Permitir ajustar el tamaño del cuadro de recorte
    cropBoxMovable: true  // Permitir mover el cuadro de recorte
  };

  configModal: ModalOptions = {
    backdrop: 'static', // Esto evita cerrar al hacer clic fuera de la ventana modal
    keyboard: false // Esto desactiva cerrar con la tecla ESC
  };

  constructor(
    private apiService: ApiService,
    private utilitiesService: UtilitiesService,
    private modalService: BsModalService,
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/' },
      { label: 'Empresa', active: true }
    ];
    this.loadCompany();
  }

  // Cargar datos de la empresa
  loadCompany(): void {
    //this.isLoading = true;
    this.apiService.get('companies/1', true).subscribe(
      (response) => {
        if (response.success) {
          this.editCompany = response.data;
          // Construir la URL completa de la imagen de la mascota si existe
          this.imageUrl = this.editCompany.companyPhoto
            ? `${this.serverUrl}${this.editCompany.companyPhoto}`
            : 'assets/images/default/40084.png';  // Imagen por defecto si no tiene
          this.isLoading = false;
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los datos de la empresa.');
      }
    );
  }

  handleFileInput(event: any) {
    if (event.target.files.length) {
      const fileTypes = ['jpg', 'jpeg', 'png'];
      const extension = event.target.files[0].name.split('.').pop().toLowerCase();
      const isSuccess = fileTypes.indexOf(extension) > -1;

      if (isSuccess) {
        const reader = new FileReader();
        const angularCropper = this.cropper;
        reader.onload = (event) => {
          if (event.target?.result) {
            angularCropper.imageUrl = event.target.result;
          }
        };
        reader.readAsDataURL(event.target.files[0]);
      } else {
        this.utilitiesService.showAlert('warning', 'Por favor, selecciona un archivo de imagen válido (jpg, jpeg o png).');
        //alert('Por favor, selecciona un archivo de imagen válido (jpg, jpeg o png).');
      }
    }
  }

  // Función para recortar la imagen
  cropImage(): void {
    this.croppedImage = this.cropper.cropper.getCroppedCanvas().toDataURL();
    //this.editCompany.companyPhoto = this.croppedImage;

    // Verifica si la imagen recortada es correcta
    //console.log('Imagen recortada:', this.croppedImage);
  }

  // Convertir la imagen base64 en un archivo
  base64ToFile(dataURI: string, filename: string): File {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeString });
  }

  // Enviar el formulario de edición
  onUpdate(): void {
    this.isLoadingBtn = true;
    this.apiService.put('companies/1', this.editCompany, true).subscribe(
      (response) => {
        this.utilitiesService.showAlert('success', 'Empresa actualizada correctamente.');
        // Si la imagen fue modificada, hacemos la segunda solicitud
        if (this.croppedImage) {
          const imageFile = this.base64ToFile(this.croppedImage as string, `${this.editCompany.companyName}.png`);
          this.uploadPhoto(imageFile);  // Subir la imagen
          this.editCompany.companyPhoto;
          this.resetCrop();
        }
        this.loadCompany();
        this.isLoadingBtn = false;
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la empresa.');
          this.isLoadingBtn = false;
        }
      }
    );
  }

  // Función para subir la imagen
  uploadPhoto(imageFile: File): void {
    const imageData = new FormData();
    imageData.append('companyPhoto', imageFile);

    this.apiService.post(`companies/1/upload`, imageData, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudo subir la imagen');
      }
    );
  }

  // Función para resetear el formulario
  resetForm(form: any): void {
    form.reset();
    this.resetCrop();
    this.ngOnInit(); // Volver a cargar los datos originales
  }

  //Abre modal Crop
  openCropModal(cropModal: TemplateRef<any>) {
    this.modalRef = this.modalService.show(cropModal, this.configModal);
  }

  //Resetear Crop
  resetCrop(): void {
    if (this.cropper) {
      // Restablecer la URL de la imagen al valor original
      this.cropper.imageUrl = this.imageUrl;
      // Vaciar la imagen recortada, ya que se está reiniciando
      this.croppedImage = '';
    }
  }

}