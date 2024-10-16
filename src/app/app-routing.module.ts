import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { Error404Component } from './account/auth/errors/error404/error404.component';
// Component
import { LayoutComponent } from './layouts/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // Proteger el dashboard con el AuthGuard
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    canActivate: [LoginGuard],  // Bloquear el acceso al login si ya está logueado
  },
  {
    path: 'error',
    component: Error404Component,
    data: {
      'type': 404,
      'title': 'Página no encontrada',
      'desc': 'Oops!! La página que buscas no existe.'
    }
  },
  { path: '**', redirectTo: 'error', pathMatch: 'full' } // Redirigir cualquier ruta no encontrada a error
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }