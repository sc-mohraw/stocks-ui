import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { LoginRequest, RegisterRequest } from '../models/login.model';

@Injectable({
    providedIn: 'root'
})


export class UserService {

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    login(data: LoginRequest): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/auth/login`,
            data,
            {
                withCredentials: true
            }
        );
    }

    register(data: RegisterRequest): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/auth/register`,
            data,
            {
                withCredentials: true
            }
        );
    }

    logoutApi() {
        return this.http.post(
            `${this.apiUrl}/auth/logout`,
            {},
            {
                withCredentials: true
            }
        );
    }

    saveUserData(data: any): void {
        localStorage.setItem('auth', JSON.stringify(data));
    }

    getUserData(): any | null {
        const data = localStorage.getItem('auth');
        return data ? JSON.parse(data) : null;
    }

    isLoggedIn(): boolean {
        return !!this.getUserData();
    }
}