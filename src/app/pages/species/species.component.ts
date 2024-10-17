import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-species',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss']
})
export class SpeciesComponent implements OnInit {

  @ViewChild('editModal') editModal!: TemplateRef<any>;
  breadCrumbItems!: Array<{}>;
  isDropup = true;
  modalRef?: BsModalRef;
  species: any[] = [];  // Lista completa de especies
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Acciones que se pueden realizar en la tabla
  newSpecie: any = { specieName: '' };  // Objeto para la nueva especie
  selectedSpecie: any = null;  // Especie seleccionada para editar
  errors: any = {};  // Errores de validación

  constructor(
    private apiService: ApiService,
    private modalService: BsModalService,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/' },
      { label: 'Especies', active: true }
    ];
    this.loadSpecies();
    this.setupActions();
  }

  // Cargar especies desde el API
  loadSpecies(): void {
    this.isLoading = true;
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data
            .filter((specie: any) => specie.specieName)  // Filtrar especies válidas
            .sort((a: any, b: any) => b.id - a.id);  // Ordenar descendente por 'id'
          this.isLoading = false;
        }
      },
      () => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies');
      }
    );
  }

  // Configurar las acciones para la tabla
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: (specie: any) => this.openEditModal(specie),
        condition: (specie: any) => true  // Todas las filas pueden ser editadas
      },
      {
        label: 'Eliminar',
        onClick: (specie: any) => this.deleteSpecie(specie.id), // Pasamos solo el ID correctamente
        condition: (specie: any) => true  // Todas las filas pueden ser eliminadas
      }
    ];
  }

  openAddModal(addModal: TemplateRef<any>) {
    this.newSpecie = { specieName: '' };
    this.errors = {};
    this.modalRef = this.modalService.show(addModal);
  }

  // Abrir modal para editar especie
  openEditModal(specie: any): void {
    this.selectedSpecie = { ...specie };
    this.errors = {};
    //this.modalService.open(this.editModal);  // Abrir modal de edición
  }

  // Enviar formulario para agregar una nueva especie
  onSubmit(modal: any): void {
    this.apiService.post('species', this.newSpecie, true).subscribe(
      (response) => {
        if (response.success) {
          this.species.push(response.data);
          this.newSpecie = { specieName: '' };
          this.errors = {};
          modal.close();
          this.utilitiesService.showAlert('success', 'Especie agregada correctamente.');
          this.loadSpecies();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la especie.');
        }
      }
    );
  }

  // Enviar formulario para editar una especie existente
  onEditSubmit(modal: any): void {
    this.apiService.put(`species/${this.selectedSpecie.id}`, this.selectedSpecie, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.species.findIndex(s => s.id === this.selectedSpecie.id);
          if (index !== -1) {
            this.species[index] = response.data;
          }
          modal.close();
          this.utilitiesService.showAlert('success', 'Especie actualizada correctamente.');
          this.loadSpecies();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la especie.');
        }
      }
    );
  }

  // Eliminar una especie y actualizar la tabla
  deleteSpecie(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`species/${id}`, true).subscribe(
            (result) => {
              this.utilitiesService.showAlert('success', 'La especie ha sido eliminada.');
              this.loadSpecies();
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la especie.';
              this.utilitiesService.showAlert('error', errorMessage)
            }
          );
        }
      });
  }

}