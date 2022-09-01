import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { PagesComponent } from './pages/pages.component';
import { NoPageFoundComponent } from './shared/no-page-found/no-page-found.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./pages/pages.module').then(m=> m.PagesModule),
  },
  { path: 'registro',component:  LoginComponent},
  { path: '404', component: NoPageFoundComponent},
  { path: '**' , redirectTo: 'registro'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes ,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
