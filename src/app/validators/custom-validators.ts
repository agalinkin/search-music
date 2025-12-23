// validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(control.value) ? null : { invalidEmail: true };
    };
  }

  static username(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
      return usernameRegex.test(control.value) ? null : { invalidUsername: true };
    };
  }

  static password(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)\S*$/;
      return passwordRegex.test(control.value) ? null : { invalidPassword: true };
    };
  }
}