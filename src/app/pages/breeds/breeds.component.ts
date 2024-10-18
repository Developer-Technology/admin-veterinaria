import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-breeds',
  templateUrl: './breeds.component.html',
  styleUrls: ['./breeds.component.scss']
})
export class BreedsComponent implements OnInit {

  @ViewChild('editModal') editModal!: TemplateRef<any>;
  breadCrumbItems!: Array<{}>;
  isDropup = true;
  modalRef?: BsModalRef;
  breeds: any[] = [];  // Lista completa de razas
  species: any[] = [];  // Lista de especies para el select
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Acciones que se pueden realizar en la tabla
  newBreed: any = { breedName: '', species_id: null };  // Objeto para la nueva raza
  selectedBreed: any = { id: null, breedName: '', species_id: null };  // Raza seleccionada para editar
  errors: any = {};  // Errores de validación
  isLoadingBtn: boolean = false;

  constructor(
    private apiService: ApiService,
    private modalService: BsModalService,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/' },
      { label: 'Razas', active: true }
    ];
    this.loadBreeds();
    this.loadSpecies();
    this.setupActions();
  }

  // Valida si el formulario es válido (ambos campos con algún valor)
  isFormValid(): boolean {
    return this.newBreed.breedName.trim() !== '';
  }

  // Cargar razas desde el API
  loadBreeds(): void {
    //this.isLoading = true;
    this.apiService.get('breeds', true).subscribe(
      (response) => {
        if (response.success) {
          this.breeds = response.data
            .filter((breed: any) => breed.breedName)  // Filtrar razas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Ordenar descendente por 'id'
          this.isLoading = false;
        }
      },
      () => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las razas');
      }
    );
  }

  // Cargar especies para el dropdown
  loadSpecies(): void {
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data;
        }
      },
      () => this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies')
    );
  }

  // Configurar las acciones para la tabla
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: (breed: any) => this.openEditModal(breed),
        condition: (breed: any) => true  // Todas las filas pueden ser editadas
      },
      {
        label: 'Eliminar',
        onClick: (breed: any) => this.deleteBreed(breed.id), // Pasamos solo el ID correctamente
        condition: (breed: any) => true  // Todas las filas pueden ser eliminadas
      }
    ];
  }

  openAddModal(addModal: TemplateRef<any>) {
    this.newBreed = { breedName: '' };
    this.errors = {};
    this.modalRef = this.modalService.show(addModal);
  }

  // Abrir modal para editar raza
  openEditModal(breed: any): void {
    this.selectedBreed = { ...breed }; // Crea una copia del objeto breed
    this.errors = {}; // Limpia los errores anteriores
    this.modalRef = this.modalService.show(this.editModal);
  }

  // Enviar formulario para agregar una nueva raza
  onSubmit(modal: any): void {
    if (!this.isFormValid()) return;
    this.isLoadingBtn = true;
    this.apiService.post('breeds', this.newBreed, true).subscribe(
      (response) => {
        if (response.success) {
          this.newBreed = { breedName: '' };  // Limpiar el formulario
          this.errors = {};  // Limpiar los errores
          // Mostrar la alerta de éxito
          this.utilitiesService.showAlert('success', 'Raza agregada correctamente.');
          // Cerrar el modal usando la referencia correcta
          this.isLoadingBtn = false;
          modal.hide();
          this.loadBreeds();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Manejar errores de validación
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la raza.');
          this.isLoadingBtn = false;
        }
      }
    );
  }

  // Enviar formulario para editar una raza existente
  onEditSubmit(): void {
    this.isLoadingBtn = true;
    this.apiService.put(`breeds/${this.selectedBreed.id}`, this.selectedBreed, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.breeds.findIndex(b => b.id === this.selectedBreed.id);
          if (index !== -1) {
            this.breeds[index] = response.data;
          }
          this.modalRef?.hide(); // Esto cerrará el modal
          this.utilitiesService.showAlert('success', 'Raza actualizada correctamente.');
          this.isLoadingBtn = false;
          this.loadBreeds();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la raza.');
          this.isLoadingBtn = false;
        }
      }
    );
  }

  // Eliminar una raza y actualizar la tabla
  deleteBreed(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.utilitiesService.showLoadingAlert('');
          this.apiService.delete(`breeds/${id}`, true).subscribe(
            () => {
              this.utilitiesService.showLoadingAlert('close');
              this.utilitiesService.showAlert('success', 'La raza ha sido eliminada.');

              // Actualizar la lista de razas con una nueva referencia
              this.breeds = this.breeds.filter(breed => breed.id !== id);  // Crear nueva referencia del array

              // Notifica a Angular que actualice el componente de la tabla
              this.breeds = [...this.breeds];  // Forzamos una nueva referencia para actualizar el componente

            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la raza.';
              this.utilitiesService.showLoadingAlert('close');
              this.utilitiesService.showAlert('error', errorMessage);
            }
          );
        }
      });
  }

}