import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  breadCrumbItems!: Array<{}>;
  supplier: any = {
    supplierDoc: '',
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierAddress: ''
  };

  isLoading: boolean = true;  // Variable para el efecto de carga
  isLoadingBtn: boolean = false;
  errors: any = {}; // Para manejar errores del backend
  emailTouched: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/' },
      { label: 'Proveedores', link: '/suppliers' },
      { label: 'Editar', active: true }
    ];
    const encodedSupplierId = this.route.snapshot.paramMap.get('id') || '';
    const supplierId = atob(encodedSupplierId);
    this.loadSupplier(supplierId);
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

  // Cargar los datos del proveedor desde la API
  loadSupplier(id: string): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get(`suppliers/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.supplier = response.data;
          this.isLoading = false;  // Detener el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Detener el estado de carga en caso de error
        if (error.status === 404) {
          // Proveedor no encontrado
          this.utilitiesService.showAlert('error', 'Proveedor no encontrado');
        } else {
          // Otro tipo de error
          this.utilitiesService.showAlert('error', 'No se pudo cargar el proveedor');
        }
        this.router.navigate(['/suppliers']);
      }
    );
  }

  // Actualizar proveedor
  onSubmit(): void {
    this.isLoadingBtn = true;
    this.apiService.put(`suppliers/${this.supplier.id}`, this.supplier, true).subscribe(
      (response) => {
        this.utilitiesService.showAlert('success', 'Proveedor actualizado correctamente.');
        this.router.navigate(['/suppliers']);
        this.isLoadingBtn = false;
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar el proveedor.');
          this.isLoadingBtn = false;
        }
      }
    );
  }

  // Función para resetear el formulario
  resetForm(form: any): void {
    form.reset();
    this.ngOnInit(); // Volver a cargar los datos originales
  }

  // Función para regresar a la lista de proveedores
  goBack(): void {
    this.router.navigate(['/suppliers']);
  }

}