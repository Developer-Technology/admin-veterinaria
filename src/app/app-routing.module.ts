import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// Component
import { LayoutComponent } from './layouts/layout.component';

const routes: Routes = [
  { 
    path: '', 
    component: LayoutComponent, 
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), 
    canActivate: [AuthGuard]  // Proteger el acceso al dashboard
  },
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
