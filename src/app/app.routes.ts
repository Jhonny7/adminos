import { Routes } from '@angular/router';
import { LayoutComponent } from './components/organisms/layout/layout';
import { App } from './app';
import { Login } from './pages/login/login.component';
import { Home } from './pages/Home/home.component';
import { Dashboard } from './pages/Dashboard/dashboard.component';
import { Labors } from './pages/Labors/labors.component';
import { Plaguicidas } from './pages/Plaguicidas/plaguicidas.component';
import { Predios } from './pages/Predios/predios.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'admin',
    component: LayoutComponent,
    //canActivate: [AuthGuard], //Activar para aplicar con seguridad
    children: [
      { path: 'resumen', component: Dashboard },
      { path: 'labores', component: Labors },
      { path: 'plaguicidas', component: Plaguicidas },
      { path: 'predios', component: Predios },
      { path: 'home', component: Home }
    ]
  }
];