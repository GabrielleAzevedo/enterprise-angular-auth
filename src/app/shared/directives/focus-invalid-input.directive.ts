import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '[appFocusInvalidInput]',
  standalone: true
})
export class FocusInvalidInputDirective {
  constructor(private el: ElementRef, private formGroupDir: FormGroupDirective) {}

  @HostListener('submit')
  onSubmit() {
    if (this.formGroupDir.control.invalid) {
      const invalidControl = this.el.nativeElement.querySelector('.ng-invalid');
      if (invalidControl) {
        // Tenta encontrar o input dentro do componente customizado ou o próprio elemento
        const input = invalidControl.querySelector('input, select, textarea') || invalidControl;
        input.focus();
      }
    }
  }
}
