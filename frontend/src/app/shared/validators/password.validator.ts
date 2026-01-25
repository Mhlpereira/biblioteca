import { AbstractControl, ValidationErrors } from "@angular/forms";

export class PasswordValidator {
    static strength(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value || "";

        if (!value) {
            return null;
        }

        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasMinLength = value.length >= 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

        const passwordValid = hasUpperCase && hasLowerCase && hasMinLength && hasSpecialChar;

        return !passwordValid
            ? {
                  passwordStrength: {
                      hasUpperCase,
                      hasLowerCase,
                      hasMinLength,
                      hasSpecialChar
                  },
              }
            : null;
    }
}
