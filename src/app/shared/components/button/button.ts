import { Component, Output, EventEmitter, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<'primary' | 'outline'>('primary');
  type = input<'submit' | 'button'>('button');
  fullWidth = input(false);
  disabled = input(false);
  loading = input(false);

  @Output() onClick = new EventEmitter<void>();

  classes = computed(() => {
    const base = 'flex items-center justify-center gap-2 font-medium rounded-lg transition-colors py-2.5 px-4 text-base focus:outline-none focus:ring-2 focus:ring-offset-1';
    
    const variants = {
      primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
      outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-primary focus:ring-gray-200'
    };

    const width = this.fullWidth() ? 'w-full' : '';
    const state = (this.disabled() || this.loading()) ? 'opacity-50 cursor-not-allowed' : '';

    return `${base} ${variants[this.variant()]} ${width} ${state}`;
  });
}
