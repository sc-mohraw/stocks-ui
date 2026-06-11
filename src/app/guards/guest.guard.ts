import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '../services/user.service';

export const guestGuard: CanActivateFn = () => {

    const userService = inject(UserService);
    const router = inject(Router);

    if (userService.isLoggedIn()) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
};