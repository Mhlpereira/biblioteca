import { AbstractControl, ValidationErrors } from '@angular/forms';
import { cpf } from 'cpf-cnpj-validator';

export class CpfValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const isValid = cpf.isValid(value);

    return isValid ? null : { cpfInvalido: true };
  }
}
