import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal(false);
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  setTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.userService
      .login(this.loginForm.value)
      .subscribe({
        next: (response: any) => {
          this.userService.saveUserData(response?.data);
          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Login failed');

          this.isLoading.set(false);
        },

        complete: () => {
          this.isLoading.set(false);
          this.successMessage.set(`Welcome back! Logged in as ${this.loginForm.value.email}`);
        }
      });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.userService
      .register(this.registerForm.value)
      .subscribe({
        next: (response: any) => {
          this.registerForm.reset();
          this.setTab('login');
        },

        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Registration failed');

          this.isLoading.set(false);
        },

        complete: () => {
          this.isLoading.set(false);
          this.successMessage.set('Registration successful! You can now log in.');
        }
      });
  }
}

