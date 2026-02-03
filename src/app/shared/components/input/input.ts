import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  forwardRef,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DoCheck,
  inject,
  effect,
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
  private cdr = inject(ChangeDetectorRef);

  label = input<string>('');
  type = input<'text' | 'email' | 'password' | 'date'>('text');
  placeholder = input<string>('');
  hint = input<string>('');
  control = input<AbstractControl | null>(null);
  errorMessages = input<Record<string, string>>({});

  value: string = '';
  isDisabled: boolean = false;

  // Gera IDs únicos e determinísticos para SSR
  private static nextId = 0;
  inputId = `app-input-${InputComponent.nextId++}`;
  errorId = `${this.inputId}-error`;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onBlur() {
    this.onTouched();
    const ctrl = this.control();
    if (ctrl) {
      // Força verificação ao sair do campo, pois 'touched' muda mas não emite evento
      const newErrorState = !!(ctrl.touched && ctrl.errors);
      if (newErrorState !== this.hasError) {
        this.hasError = newErrorState;
        this.currentErrorMessage = this.calculateErrorMessage();
        this.cdr.markForCheck();
      }
    }
  }

  showPassword = signal(false);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly AlertCircle = AlertCircle;

  // State for error handling
  hasError = false;
  currentErrorMessage: string | null = null;

  constructor() {
    effect(() => {
      const ctrl = this.control();
      if (ctrl) {
        // Monitora mudanças de status e valor para atualizar erro
        // Usamos statusChanges para validação e valueChanges para limpar erro ao digitar se necessário
        const updateError = () => {
          const newErrorState = !!(ctrl.touched && ctrl.errors);
          if (newErrorState !== this.hasError || (newErrorState && ctrl.errors)) {
            this.hasError = newErrorState;
            this.currentErrorMessage = this.calculateErrorMessage();
            this.cdr.markForCheck();
          }
        };

        const subStatus = ctrl.statusChanges.subscribe(updateError);
        const subValue = ctrl.valueChanges.subscribe(updateError);

        // Também verifica imediatamente
        updateError();

        return () => {
          subStatus.unsubscribe();
          subValue.unsubscribe();
        };
      }
      return undefined;
    });
  }

  toggleShowPassword() {
    this.showPassword.update((val) => !val);
  }

  inputType = computed(() => {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  });

  // Removido computed properties quebradas e substituído por cálculo no ngDoCheck

  private calculateErrorMessage(): string | null {
    if (!this.hasError) {
      return null;
    }

    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return null;

    const errors = ctrl.errors;
    const errorKey = Object.keys(errors)[0];

    // Prioridade: Mensagem customizada do input > Constante global
    const customMessages = this.errorMessages();
    if (customMessages && customMessages[errorKey]) {
      return customMessages[errorKey];
    }

    const messageFn = VALIDATION_MESSAGES[errorKey];
    if (messageFn) {
      return messageFn(errorKey === 'required' ? this.label() : errors[errorKey]);
    }

    return VALIDATION_MESSAGES['default']();
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }
}
