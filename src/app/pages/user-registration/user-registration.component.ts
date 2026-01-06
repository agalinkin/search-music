// pages/user-registration/user-registration.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomValidators } from '../../validators/custom-validators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to search
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/search']);
      return;
    }

    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, CustomValidators.email()]],
      username: ['', [Validators.required, CustomValidators.username()]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.password()]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const { email, username, password } = this.registrationForm.value;

      this.authService.register(email, password, username).subscribe({
        next: (success) => {
          if (success) {
            // ✅ Redirect to search page after successful registration
            console.log('Registration successful, redirecting to search...');
            this.router.navigate(['/search']);
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.get(key)?.markAsTouched();
    });
  }
}