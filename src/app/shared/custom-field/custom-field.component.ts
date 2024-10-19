import { Component, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss']
})
export class CustomFieldComponent {

  @Input() imageUrl?: string = '';  // URL de la imagen
  @Input() title: string = '';     // Título (e.g., nombre de la mascota)
  @Input() subtitle: string = '';  // Subtítulo (e.g., especie y raza)

  serverUrl: string;

  constructor(
    private apiService: ApiService,
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  get validImageUrl(): string {
    return this.imageUrl && this.imageUrl.trim() !== this.serverUrl + 'null' ? this.imageUrl : 'assets/images/default/blank-photo.png';
  }
  
}