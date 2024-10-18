import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  breadCrumbItems!: Array<{}>;
  isLoading: boolean = false;
  newSupplier: any = {
    supplierDoc: '',
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierAddress: ''
  };

  errors: any = {}; // Para manejar errores del backend
  emailTouched: boolean = false;  // Verificar si el usuario interactuó con el campo de email

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/' },
      { label: 'Proveedores', link: '/suppliers' },
      { label: 'Agregar', active: true }
    ];
  }

  // Validación de formato de correo electrónico
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
  }

  // Detectar cuando el usuario está escribiendo en el campo de correo
  onEmailInput(): void {
    this.emailTouched = true;  // Marcar que el campo de email fue tocado
  }

  // Enviar formulario para agregar proveedor
  onSubmit(): void {
    this.isLoading = true;
    this.apiService.post('suppliers', this.newSupplier, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);
          this.router.navigate(['/suppliers']);
          this.isLoading = false;
        }
      },
      (error) => {
        if (error.status === 422) { // Errores de validación desde el backend
          this.errors = error.error.errors;
          this.isLoading = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar el proveedor');
          this.isLoading = false;
        }
      }
    );
  }

  // Método para resetear el formulario
  resetForm(supplierForm: any): void {
    supplierForm.resetForm();  // Resetear los campos del formulario
    this.newSupplier = {       // Restablecer el estado inicial del objeto
      supplierDoc: '',
      supplierName: '',
      supplierEmail: '',
      supplierPhone: '',
      supplierAddress: ''
    };
    this.errors = {};
    this.emailTouched = false;
  }

  // Método para regresar a "/suppliers"
  goBack(): void {
    this.router.navigate(['/suppliers']);
  }

}