import { Routes } from '@angular/router';
import { LayoutComponent } from './components/organisms/layout/layout';
import { App } from './app';
import { Login } from './pages/login/login.component';
import { Home } from './pages/Home/home.component';
import { Dashboard } from './pages/Dashboard/dashboard.component';
import { Labors } from './pages/Labors/labors.component';
import { Plaguicidas } from './pages/Plaguicidas/plaguicidas.component';
import { ReturnsCosts } from './pages/ReturnsCosts/returns-costs.component';
import { Predios } from './pages/Predios/predios.component';
import { AuthGuard } from './guards/auth.guard';
import { EliminarCuenta } from './pages/EliminarCuenta/eliminar-cuenta.component';

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
    path: 'eliminar-cuenta',
    component: EliminarCuenta
  },
  {
    path: 'admin',
    component: LayoutComponent,
    //canActivate: [AuthGuard], //Activar para aplicar con seguridad
    children: [
      { path: 'resumen', component: Dashboard },
      { path: 'labores', component: Labors },
      { path: 'plaguicidas', component: Plaguicidas },
      { path: 'returns-costs', component: ReturnsCosts },
      { path: 'predios', component: Predios },
      { path: 'home', component: Home }
    ]
  }
];