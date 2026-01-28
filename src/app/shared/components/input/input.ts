import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
  AbstractControl,
} from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff, AlertCircle } from 'lucide-angular';

import { VALIDATION_MESSAGES } from '../../../core/constants/validation-messages';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'date' = 'text';
  @Input() placeholder: string = '';
  @Input() control?: AbstractControl | null = null;

  // Permite sobrescrever mensagens de erro por input
  @Input() errorMessages?: Record<string, string>;

  value: string = '';
  isDisabled: boolean = false;

  // Gera IDs únicos e determinísticos para SSR
  private static nextId = 0;
  inputId = `app-input-${InputComponent.nextId++}`;
  errorId = `${this.inputId}-error`;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  showPassword = signal(false);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly AlertCircle = AlertCircle;

  toggleShowPassword() {
    this.showPassword.update((val) => !val);
  }

  get inputType(): 'text' | 'password' | 'date' | 'email' {
    if (this.type === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type;
  }

  get errorState(): boolean {
    return !!(this.control && this.control.touched && this.control.errors);
  }

  get errorMessage(): string | null {
    if (!this.errorState || !this.control?.errors) {
      return null;
    }

    const errors = this.control.errors;
    const errorKey = Object.keys(errors)[0];

    // Prioridade: Mensagem customizada do input > Constante global
    if (this.errorMessages && this.errorMessages[errorKey]) {
      return this.errorMessages[errorKey];
    }

    const messageFn = VALIDATION_MESSAGES[errorKey];
    if (messageFn) {
      return messageFn(errorKey === 'required' ? this.label : errors[errorKey]);
    }

    return VALIDATION_MESSAGES['default']();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}