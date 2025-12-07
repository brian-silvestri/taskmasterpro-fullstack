import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">TaskMaster Pro</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
            <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
              Email is required
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
               class="text-red-500 text-sm mt-1">
              Password is required
            </p>
          </div>

          <div *ngIf="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {{ errorMessage }}
          </div>

          <button 
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center text-gray-600 mt-6">
          Don't have an account? 
          <a routerLink="/register" class="text-blue-600 hover:underline">Register</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}
