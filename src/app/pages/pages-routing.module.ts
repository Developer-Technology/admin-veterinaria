import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
  },
  //Mascotas
  {
    path: 'species', loadChildren: () => import('./species/species.module').then(m => m.SpeciesModule)
  },
  {
    path: 'breeds', loadChildren: () => import('./breeds/breeds.module').then(m => m.BreedsModule)
  },
  {
    path: 'vaccines', loadChildren: () => import('./vaccines/vaccines.module').then(m => m.VaccinesModule)
  },
  {
    path: 'pets', loadChildren: () => import('./pets/pets.module').then(m => m.PetsModule)
  },
  //Personas
  {
    path: 'clients', loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule)
  },
  {
    path: 'suppliers', loadChildren: () => import('./suppliers/suppliers.module').then(m => m.SuppliersModule)
  },
  {
    path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
  },
  //Empresa
  {
    path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
  },
  //Historias
  {
    path: 'histories', loadChildren: () => import('./histories/histories.module').then(m => m.HistoriesModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }