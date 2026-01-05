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
    // Если уже залогинен, редирект
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

      this.authService.register(email, username, password).subscribe({
        next: (success) => {
          if (success) {
            // Перенаправить на подключение Spotify
            this.router.navigate(['/spotify-connect']);
          }
        },
        error: (error) => {
          this.errorMessage = 'Registration failed. Please try again.';
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