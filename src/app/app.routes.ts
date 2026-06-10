import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Stocks } from './components/stocks/stocks';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: "login",
        component: Login,
        canActivate: [guestGuard]
    },
    {
        path: 'stocks',
        component: Stocks,
        canActivate: [authGuard]
    }
];
