import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Mail } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent, AuthLayout],
  templateUrl: './verify-email.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent {
  // Pega o email diretamente do histórico de navegação (padrão moderno)
  email = history.state['email'] || '';

  readonly MailIcon = Mail;
}