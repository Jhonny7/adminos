import { Routes } from '@angular/router';
import { LayoutComponent } from './components/organisms/layout/layout';
import { App } from './app';
import { Login } from './pages/login/login.component';
import { Home } from './pages/Home/home.component';
import { Dashboard } from './pages/Dashboard/dashboard.component';
import { Labors } from './pages/Labors/labors.component';
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
      { path: '', component: Dashboard },
      { path: 'labors', component: Labors },
      { path: 'home', component: Home }
    ]
  }
];