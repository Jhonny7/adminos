import { Routes } from '@angular/router';
import { LayoutComponent } from './components/organisms/layout/layout';
import { App } from './app';
import { Login } from './pages/login/login.component';
import { Home } from './pages/Home/home.component';
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
      { path: '', component: Home }
    ]
  }
];