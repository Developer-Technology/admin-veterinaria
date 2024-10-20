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
  client: any = {
    clientDoc: '',
    clientName: '',
    clientGender: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: ''
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
      { label: 'Clientes', link: '/clients' },
      { label: 'Editar', active: true }
    ];
    const encodedClientId = this.route.snapshot.paramMap.get('id') || '';
    const clientId = atob(encodedClientId);
    this.loadClient(clientId);
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

  // Cargar los datos del cliente desde la API
  loadClient(id: string): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get(`clients/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.client = response.data;
          this.isLoading = false;  // Detener el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Detener el estado de carga en caso de error
        if (error.status === 404) {
          // Cliente no encontrado
          this.utilitiesService.showAlert('error', 'Cliente no encontrado');
        } else {
          // Otro tipo de error
          this.utilitiesService.showAlert('error', 'No se pudo cargar el cliente');
        }
        this.router.navigate(['/clients']);
      }
    );
  }

  // Actualizar cliente
  onSubmit(): void {
    this.isLoadingBtn = true;
    this.apiService.put(`clients/${this.client.id}`, this.client, true).subscribe(
      (response) => {
        this.utilitiesService.showAlert('success','Cliente actualizado correctamente.');
        this.router.navigate(['/clients']);
        this.isLoadingBtn = false;
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error','No se pudo actualizar el cliente.');
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

  // Función para regresar a la lista de clientes
  goBack(): void {
    this.router.navigate(['/clients']);
  }

}