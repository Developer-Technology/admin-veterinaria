import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrl: './datatable.component.scss'
})
export class DatatableComponent implements OnInit {

  @Input() columns: any[] = [];  // Columnas que se mostrarán en la tabla
  @Input() data: any[] = [];  // Datos a mostrar
  @Input() itemsPerPage: number = 5;  // Número de elementos por página
  @Input() actions: any[] = [];  // Acciones que se pueden realizar en cada fila (editar, eliminar, etc.)
  @Input() tableName: string = '';  // Nombre de la tabla (Recibido desde la vista)
  @Input() exportName: string = '';  // Nombre de la tabla para exportar (Recibido desde la vista)

  currentPage: number = 1;  // Página actual
  searchQuery: string = '';  // Filtro de búsqueda
  filteredData: any[] = [];  // Datos filtrados
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  serverUrl: string;
  masterSelected: boolean = false;  // Estado del checkbox maestro
  selectedItems: any[] = [];  // Elementos seleccionados (IDs de los elementos seleccionados)
  checkedValGet: any[] = [];  // IDs de los elementos seleccionados
  visibleColumns: any[] = []; // Array para gestionar las columnas visibles

  constructor(
    private apiService: ApiService,
    private utilitiesService: UtilitiesService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // Actualiza los datos filtrados cuando se actualizan los datos
      this.filteredData = [...this.data];
      this.resetSelection();  // Restablecer la selección al cambiar los datos
    }
  }

  ngOnInit(): void {
    this.filteredData = this.data;  // Inicializar con todos los datos
    this.visibleColumns = this.columns.filter(col => col.label !== 'Acciones' && col.label !== 'Seleccionar');  // Iniciar con todas las columnas visibles excepto las que no exportamos
  }

  // Función para manejar la búsqueda
  onSearch(): void {
    this.filteredData = this.data.filter(item => {
      return this.columns.some(column => {
        return item[column.key]?.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    });
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Paginación: Obtener datos paginados
  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = this.totalPages.length;
    if (page < 1) {
      this.currentPage = 1;
    } else if (page > totalPages) {
      this.currentPage = totalPages;
    } else {
      this.currentPage = page;
    }
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    return Array(totalPages).fill(0).map((_, i) => i + 1);
  }

  // Función para ordenar los datos por columna
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      let comparison = 0;
      if (valueA > valueB) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Obtener el icono de ordenación
  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'icon-arrow-up' : 'icon-arrow-down';
    }
    return 'icon-chevron-up-down';
  }

  // Mostrar total de registros y la cantidad mostrada actualmente
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
    // Si no hay resultados, se muestra "Mostrando 0 de 0 resultados"
    if (this.filteredData.length === 0) {
      return `Mostrando 0 de 0 resultados`;
    }
    return `Mostrando ${start} - ${end} de ${this.filteredData.length} resultados`;
  }

  // Total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.data.length}`;
  }

  // Obtener el número total de páginas en formato compacto
  get compactTotalPages(): number[] {
    const totalPages = this.totalPages.length;
    const pagesToShow = 5;  // Número fijo de páginas a mostrar
    const visiblePages = [];

    if (totalPages <= pagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      const halfWindow = Math.floor(pagesToShow / 2);
      let startPage = Math.max(1, this.currentPage - halfWindow);
      let endPage = Math.min(totalPages, this.currentPage + halfWindow);

      if (this.currentPage <= halfWindow) {
        endPage = pagesToShow;
      } else if (this.currentPage + halfWindow >= totalPages) {
        startPage = totalPages - pagesToShow + 1;
      }

      if (startPage > 1) {
        visiblePages.push(1);
        if (startPage > 2) {
          visiblePages.push(-1);  // Puntos suspensivos
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          visiblePages.push(-1);  // Puntos suspensivos
        }
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);  // Obtener el valor seleccionado
    this.currentPage = 1;  // Reinicia la página a la primera
    this.changePage(1);  // Actualiza la vista
  }

  // Verificar si la acción es visible
  isActionVisible(action: any, item: any): boolean {
    return action.condition ? action.condition(item) : true;
  }

  isLastRecord(index: number): boolean {
    // Verifica si el índice es uno de los últimos para habilitar el dropdown hacia arriba
    return index >= this.paginatedData.length - 1;
  }

  // Checkbox maestro: Marcar o desmarcar todas las filas
  checkUncheckAll(ev: any): void {
    this.masterSelected = ev.target.checked;  // Actualizar el estado del checkbox maestro
    this.selectedItems = [];  // Restablecer la selección
    this.filteredData.forEach((item) => {
      item.isSelected = this.masterSelected;  // Actualizar la selección de cada fila
      if (this.masterSelected) {
        this.selectedItems.push(item.id);  // Capturar los IDs de los elementos seleccionados
      }
    });
    this.updateCheckedValues();  // Actualizar el array de IDs seleccionados
  }

  // Verifica si todas las filas están seleccionadas
  isAllChecked(): boolean {
    return this.filteredData.every(item => item.isSelected);
  }

  // Marcar/desmarcar una fila individual
  checkItemSelection(item: any, event: any): void {
    item.isSelected = event.target.checked;  // Actualizar el estado de selección de la fila
    if (item.isSelected) {
      this.selectedItems.push(item.id);  // Agregar el ID a la lista seleccionada
    } else {
      this.selectedItems = this.selectedItems.filter(id => id !== item.id);  // Eliminar el ID si no está seleccionado
    }
    this.masterSelected = this.isAllChecked();  // Verificar si todas las filas están seleccionadas
    this.updateCheckedValues();  // Actualizar el array de IDs seleccionados
  }

  // Actualiza los elementos seleccionados
  updateCheckedValues(): void {
    this.checkedValGet = [...this.selectedItems];  // Clonar los elementos seleccionados en checkedValGet
  }

  // Restablece la selección al cambiar la página o actualizar los datos
  resetSelection(): void {
    this.masterSelected = false;
    this.selectedItems = [];
    this.filteredData.forEach(item => item.isSelected = false);
    this.updateCheckedValues();
  }

  deleteSelectedItems(selectedIds: string[]): void {
    if (selectedIds.length === 0) {
      this.utilitiesService.showAlert('warning', 'No hay elementos seleccionados para eliminar.');
      return;
    }

    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', 'Se eliminarán ' + selectedIds.length + ' registros. ¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.utilitiesService.showLoadingAlert('');

          let deleteCount = 0;  // Contador para el progreso de eliminaciones exitosas o fallidas
          const failedDeletes: string[] = [];  // IDs que no pudieron ser eliminados

          selectedIds.forEach((id) => {
            this.apiService.delete(`${this.tableName}/${id}`, true).subscribe(
              () => {
                deleteCount++;  // Incrementar el contador de eliminaciones procesadas

                // Actualizar la lista de elementos después de cada eliminación exitosa
                this.data = this.data.filter(item => item.id !== id);
                this.filteredData = [...this.data];  // Forzar la actualización de la tabla

                // Si todos los IDs fueron procesados (exitosos o fallidos)
                if (deleteCount === selectedIds.length) {
                  // Limpiar los elementos seleccionados
                  this.selectedItems = [];
                  this.checkedValGet = [];

                  // Cerrar la alerta de carga
                  this.utilitiesService.showLoadingAlert('close');

                  // Mostrar una alerta de éxito o alerta de mezcla de resultados
                  if (failedDeletes.length === 0) {
                    this.utilitiesService.showAlert('success', `Se han eliminado ${deleteCount} registros correctamente.`);
                  } else {
                    this.utilitiesService.showAlert('warning', `Se eliminaron ${deleteCount - failedDeletes.length} registros correctamente, pero no se pudo eliminar ${failedDeletes.length} registros, es probable que tenga registros asociados.`);
                  }
                }
              },
              (error) => {
                deleteCount++;  // Incrementar el contador, incluso si la eliminación falló
                failedDeletes.push(id);  // Agregar el ID fallido al array

                // Si todos los IDs fueron procesados (exitosos o fallidos)
                if (deleteCount === selectedIds.length) {
                  // Limpiar los elementos seleccionados
                  this.selectedItems = [];
                  this.checkedValGet = [];

                  // Cerrar la alerta de carga
                  this.utilitiesService.showLoadingAlert('close');

                  // Mostrar alerta de mezcla de resultados
                  this.utilitiesService.showAlert('warning', `Se eliminaron ${deleteCount - failedDeletes.length} registros correctamente, pero no se pudo eliminar ${failedDeletes.length} registros, es probable que tenga registros asociados.`);
                }
              }
            );
          });
        }
      });
  }

  // Verificar si hay columnas seleccionadas
  validateColumnSelection(): boolean {
    return this.visibleColumns.length > 0;
  }

  // Mostrar alerta si no hay columnas seleccionadas
  showNoColumnSelectedAlert(): void {
    this.utilitiesService.showAlert('warning', 'Debe seleccionar al menos una columna para exportar o imprimir.');
  }

  exportToPDF(): void {

    if (!this.validateColumnSelection()) {
      this.showNoColumnSelectedAlert();
      return;
    }

    // Definir la orientación del PDF basado en la cantidad de columnas
    const orientation = this.visibleColumns.length > 5 ? 'l' : 'p';  // Si hay más de 5 columnas, usar orientación horizontal
    const doc = new jsPDF(orientation, 'mm', 'a4');  // Ajustar orientación basado en la cantidad de columnas

    // Agregar logo (opcional) - Agrega la ruta correcta al logo
    const logo = 'assets/images/companies/img-1.png';  // Puedes agregar un logo si lo deseas
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;  // Tamaño del logo en mm
    const logoHeight = 15;

    doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);  // Agregar logo al PDF

    // Título del reporte
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Tabla de Datos ' + this.exportName + '', pageWidth / 2, 20, { align: 'center' });

    // Subtítulo con fecha de generación
    const today = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    doc.setFontSize(12);
    doc.text(`Generado el: ${today}`, pageWidth / 2, 28, { align: 'center' });

    // Agregar la tabla
    const columns = this.visibleColumns.map(col => col.label);
    const rows = this.filteredData.map(item => {
      return this.visibleColumns.map(col => item[col.key]);
    });

    doc.setFontSize(10);
    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 40,  // Espacio desde la parte superior para dejar lugar al encabezado
      theme: 'grid',  // Tema de la tabla
      headStyles: { fillColor: [71, 87, 120], textColor: [255, 255, 255] },  // Color de encabezado
      alternateRowStyles: { fillColor: [240, 240, 240] },  // Alternar color de filas
      margin: { top: 30 },
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 5, halign: 'center' },  // Estilos generales
      didDrawPage: function (data: any) {  // Declarar el tipo de data como any
        // Agregar pie de página
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text('Página ' + doc.getNumberOfPages(), data.settings.margin.left, pageHeight - 10);  // Utilizar doc.getNumberOfPages()
      }
    });

    // Descargar el archivo PDF
    doc.save('Tabla_' + this.exportName + '_' + new Date().getTime() + '.pdf');
  }

  printTable(): void {

    if (!this.validateColumnSelection()) {
      this.showNoColumnSelectedAlert();
      return;
    }

    // Crear una nueva ventana
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      // Generar el contenido HTML que deseas imprimir
      let printContent = `
            <html>
            <head>
                <title>Imprimir Tabla</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table, th, td {
                        border: 1px solid black;
                    }
                    th, td {
                        padding: 8px;
                        text-align: center;
                    }
                    th {
                        background-color: #475778;
                        color: white;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h2 style="text-align: center;">Reporte de Tabla de Datos</h2>
                <h4 style="text-align: center;">Generado el: ${formatDate(new Date(), 'dd/MM/yyyy', 'en-US')}</h4>
                <table>
                    <thead>
                        <tr>`;

      // Agregar los encabezados de la tabla
      this.visibleColumns.forEach(col => {
        printContent += `<th>${col.label}</th>`;
      });

      printContent += `</tr></thead><tbody>`;

      // Agregar las filas de la tabla
      this.filteredData.forEach(item => {
        printContent += `<tr>`;
        this.visibleColumns.forEach(col => {
          printContent += `<td>${item[col.key]}</td>`;
        });
        printContent += `</tr>`;
      });

      printContent += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

      // Escribir el contenido en la ventana de impresión
      printWindow.document.write(printContent);
      printWindow.document.close(); // Necesario para cerrar el flujo de escritura

      // Esperar un momento para que el contenido se renderice correctamente
      setTimeout(() => {
        printWindow.print();  // Ejecutar la función de impresión
        printWindow.close();  // Cerrar la ventana después de la impresión
      }, 500);
    } else {
      this.utilitiesService.showAlert('error', 'No se pudo abrir la ventana de impresión.');
    }
  }

  exportToExcel(): void {

    if (!this.validateColumnSelection()) {
      this.showNoColumnSelectedAlert();
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredData.map(item => {
      const row: any = {};
      this.visibleColumns.forEach(col => {
        row[col.label] = item[col.key];  // Mapea las columnas y filas de datos
      });
      return row;
    }));

    // Crear libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DatosTabla');

    // Exportar como archivo Excel
    const fileName = `reporte_${this.exportName}_${new Date().getTime()}.xlsx`;  // Nombre dinámico para el archivo
    XLSX.writeFile(wb, fileName);
  }

  toggleColumnVisibility(column: any): void {
    const index = this.visibleColumns.indexOf(column);
    if (index > -1) {
      this.visibleColumns.splice(index, 1);  // Remover columna si está visible
    } else {
      this.visibleColumns.push(column);  // Agregar columna si está oculta
    }
  }

  // Verifica si la columna es visible
  isColumnVisible(column: any): boolean {
    return this.visibleColumns.includes(column);
  }

}