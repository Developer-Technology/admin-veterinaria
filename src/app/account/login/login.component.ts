import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  year: number = new Date().getFullYear();
  fieldTextType!: boolean;
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  returnUrl: any;
  emailTouched: boolean = false;  // Para verificar si el usuario interactuó con el campo
  passwordTouched: boolean = false;  // Para verificar si el usuario interactuó con el campo
  validationErrors: any = {}; // Almacenar errores de validación

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Este método se llama cuando el usuario interactúa con el campo de correo
  onEmailInput() {
    this.emailTouched = true;
    this.validationErrors.email = null; // Limpiar el error al interactuar
  }

  // Este método se llama cuando el usuario interactúa con el campo de contraseña
  onPasswordInput() {
    this.passwordTouched = true;
    this.validationErrors.password = null; // Limpiar el error al interactuar
  }

  // Valida si el formulario es válido (ambos campos con algún valor)
  isFormValid(): boolean {
    return this.email.trim() !== '' && this.password.trim() !== '';
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    this.isLoading = true;
    this.validationErrors = {}; // Limpiar errores previos
    this.apiService.post('auth/login', { email: this.email, password: this.password }).subscribe(
      (response) => {
        if (response.success) {
          localStorage.setItem('isLoggedin', 'true');
          localStorage.setItem('token', response.token);
          this.router.navigate([this.returnUrl]);
        } else {
          this.isLoading = false;
          this.utilitiesService.showAlert('error', response.message);
        }
      },
      (error) => {
        this.isLoading = false;
        if (error.status === 422) {  // Errores de validación
          this.validationErrors = error.error.errors; // Capturamos los errores del API
        } else {
          this.utilitiesService.showAlert('error', error.error.message);
        }
      }
    );
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}