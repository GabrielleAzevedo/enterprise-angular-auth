import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ToastService, ToastType } from '../../../core/services';
import { ToastService, ToastType } from '../../../core/services/toast/toast.service';
import {
  LucideAngularModule,
  CircleCheck,
  CircleAlert,
  Info,
  X,
  TriangleAlert,
} from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  // Ícones
  readonly CheckCircle = CircleCheck;
  readonly AlertCircle = CircleAlert;
  readonly Info = Info;
  readonly AlertTriangle = TriangleAlert;
  readonly X = X;

  remove(id: string) {
    this.toastService.remove(id);
  }

  getIcon(type: ToastType) {
    switch (type) {
      case 'success':
        return this.CheckCircle;
      case 'error':
        return this.AlertCircle;
      case 'warning':
        return this.AlertTriangle;
      default:
        return this.Info;
    }
  }

  getStyles(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-white border-green-500 text-green-700 shadow-green-100';
      case 'error':
        return 'bg-white border-red-500 text-red-700 shadow-red-100';
      case 'warning':
        return 'bg-white border-yellow-500 text-yellow-700 shadow-yellow-100';
      default:
        return 'bg-white border-blue-500 text-blue-700 shadow-blue-100';
    }
  }
}
