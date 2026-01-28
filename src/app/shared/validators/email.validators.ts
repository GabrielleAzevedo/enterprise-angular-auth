import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) {
    return null; // O 'required' lidar com campo vazio
  }

  // Regex mais rigoroso que o padrão do Angular
  // Exige @, domínio com pelo menos um ponto, e não permite espaços
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const valid = emailRegex.test(value);

  return !valid ? { emailInvalidBackend: true } : null;
};
