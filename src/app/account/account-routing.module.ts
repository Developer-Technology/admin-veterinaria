import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Component
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
// Guard
import { LoginGuard } from '../core/guards/login.guard';

const routes: Routes = [
  {
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard] // Asegura que no pueda acceder al login si ya está logueado
  },
  {
    path: 'register',
    component: RegisterComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
