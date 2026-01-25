import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class MatchValidator {
    static match(controlName: string, checkControlName: string): ValidatorFn {
        return (controls: AbstractControl): ValidationErrors | null => {
            const control = controls.get(controlName);
            const checkControl = controls.get(checkControlName);

            if (checkControl?.errors && !checkControl.errors["matching"]) {
                return null;
            }

            if (control?.value !== checkControl?.value) {
                checkControl?.setErrors({ matching: true });
                return { matching: true };
            } else {
                checkControl?.setErrors(null);
                return null;
            }
        };
    }
}
