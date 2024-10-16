import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedin = localStorage.getItem('isLoggedin');

    // Verificar si el usuario está logueado
    if (isLoggedin === 'true') {
      // Si está logueado y la URL es vacía, redirigir al dashboard
      if (state.url === '/') {
        this.router.navigate(['/dashboard']); // Redirigir al dashboard
        return false;
      }
      return true; // Permitir acceso a otras rutas si está logueado
    } else {
      // Si no está logueado, redirigir al login
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

}