import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
  },
  {
    path: 'species', loadChildren: () => import('./species/species.module').then(m => m.SpeciesModule)
  },
  {
    path: 'breeds', loadChildren: () => import('./breeds/breeds.module').then(m => m.BreedsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }