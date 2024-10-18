import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrls: ['./vaccines.component.scss']
})
export class VaccinesComponent implements OnInit {

  @ViewChild('editModal') editModal!: TemplateRef<any>;
  breadCrumbItems!: Array<{}>;
  isDropup = true;
  modalRef?: BsModalRef;
  vaccines: any[] = [];  // Lista completa de vacunas
  species: any[] = [];  // Lista de especies para el select
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Acciones que se pueden realizar en la tabla
  newVaccine: any = { vaccineName: '', species_id: null };  // Objeto para la nueva vacuna
  selectedVaccine: any = { id: null, vaccineName: '', species_id: null };  // Vacuna seleccionada para editar
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
      { label: 'Vacunas', active: true }
    ];
    this.loadVaccines();
    this.loadSpecies();
    this.setupActions();
  }

  // Valida si el formulario es válido (ambos campos con algún valor)
  isFormValid(): boolean {
    return this.newVaccine.vaccineName.trim() !== '' && this.newVaccine.species_id !== null;
  }

  // Cargar vacunas desde el API
  loadVaccines(): void {
    //this.isLoading = true;
    this.apiService.get('vaccines', true).subscribe(
      (response) => {
        if (response.success) {
          this.vaccines = response.data
            .filter((vaccine: any) => vaccine.vaccineName)  // Filtrar vacunas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Ordenar descendente por 'id'
          this.isLoading = false;
        }
      },
      () => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las vacunas');
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
        onClick: (vaccine: any) => this.openEditModal(vaccine),
        condition: (vaccine: any) => true  // Todas las filas pueden ser editadas
      },
      {
        label: 'Eliminar',
        onClick: (vaccine: any) => this.deleteVaccine(vaccine.id), // Pasamos solo el ID correctamente
        condition: (vaccine: any) => true  // Todas las filas pueden ser eliminadas
      }
    ];
  }

  openAddModal(addModal: TemplateRef<any>) {
    this.newVaccine = { vaccineName: '', species_id: null };
    this.errors = {};
    this.modalRef = this.modalService.show(addModal);
  }

  // Abrir modal para editar vacuna
  openEditModal(vaccine: any): void {
    this.selectedVaccine = { ...vaccine }; // Crea una copia del objeto vaccine
    this.errors = {}; // Limpia los errores anteriores
    this.modalRef = this.modalService.show(this.editModal);
  }

  // Enviar formulario para agregar una nueva vacuna
  onSubmit(modal: any): void {
    if (!this.isFormValid()) return;
    this.isLoadingBtn = true;
    this.apiService.post('vaccines', this.newVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          this.newVaccine = { vaccineName: '', species_id: null };  // Limpiar el formulario
          this.errors = {};  // Limpiar los errores
          // Mostrar la alerta de éxito
          this.utilitiesService.showAlert('success', 'Vacuna agregada correctamente.');
          // Cerrar el modal usando la referencia correcta
          this.isLoadingBtn = false;
          modal.hide();
          this.loadVaccines();
        }
      },
      (error) => {
        this.isLoadingBtn = false;
        if (error.status === 422) {
          this.errors = error.error.errors;  // Manejar errores de validación
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la vacuna.');
          this.isLoadingBtn = false;
        }
      }
    );
  }

  // Enviar formulario para editar una vacuna existente
  onEditSubmit(): void {
    this.isLoadingBtn = true;
    this.apiService.put(`vaccines/${this.selectedVaccine.id}`, this.selectedVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.vaccines.findIndex(v => v.id === this.selectedVaccine.id);
          if (index !== -1) {
            this.vaccines[index] = response.data;
          }
          this.modalRef?.hide(); // Esto cerrará el modal
          this.utilitiesService.showAlert('success', 'Vacuna actualizada correctamente.');
          this.isLoadingBtn = false;
          this.loadVaccines();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
          this.isLoadingBtn = false;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la vacuna.');
          this.isLoadingBtn = false;
        }
      }
    );
  }

  // Eliminar una vacuna y actualizar la tabla
  deleteVaccine(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`vaccines/${id}`, true).subscribe(
            () => {
              this.utilitiesService.showAlert('success', 'La vacuna ha sido eliminada.');

              // Actualizar la lista de vacunas con una nueva referencia
              this.vaccines = this.vaccines.filter(vaccine => vaccine.id !== id);  // Crear nueva referencia del array

              // Notifica a Angular que actualice el componente de la tabla
              this.vaccines = [...this.vaccines];  // Forzamos una nueva referencia para actualizar el componente

            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la vacuna.';
              this.utilitiesService.showAlert('error', errorMessage);
            }
          );
        }
      });
  }

}