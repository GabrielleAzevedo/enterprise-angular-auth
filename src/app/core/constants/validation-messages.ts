export const VALIDATION_MESSAGES: Record<string, (params?: any) => string> = {
  required: (label?: string) => `${label || 'Campo'} é obrigatório`,
  email: () => 'Email inválido',
  minlength: (params: { requiredLength: number }) =>
    `Mínimo de ${params.requiredLength} caracteres`,
  emailTaken: () => 'Email já registrado',
  emailInvalidBackend: () => 'Email inválido',
  passwordStrength: () => 'Senha fraca (min. 1 maiúscula, 1 minúscula, 1 número, 1 símbolo)',
  passwordMismatch: () => 'As senhas não coincidem',
  default: () => 'Valor inválido',
};