import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class UtilitiesService {

    constructor() { }

    // Mostrar alertas con SweetAlert2
    showAlert(type: 'success' | 'error' | 'warning' | 'info' | 'question', message: string) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            text: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    showLoadingAlert(status: string): void {
        if (status === 'close') {
            Swal.close();
        } else {
            Swal.fire({
                allowOutsideClick: false,
                icon: 'info',
                title: 'Cargando...',
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
    }

    // Función para truncar texto
    truncateText(text: string, limit: number): string {
        if (text.length > limit) {
            return text.substring(0, limit) + '...';
        }
        return text;
    }

    // Función reutilizable para la confirmación de eliminación
    showConfirmationDelet(
        title: string,
        text: string,
        confirmButtonText: string = 'Sí, eliminar',
        cancelButtonText: string = 'Cancelar'
    ): Promise<any> {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText
        });
    }

    // Función para convertir una fecha al formato 'yyyy-MM-dd'
    formatToDateString(date: any): string {
        if (date) {
            const selectedDate = typeof date === 'string' ? new Date(date) : date;
            return selectedDate.toISOString().split('T')[0];
        }
        return '';
    }

    // Formatear la fecha en "dd-MM-yyyy"
    formatDate(date: Date): string {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

}