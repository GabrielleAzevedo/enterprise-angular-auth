import { Component, inject, OnInit, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastComponent } from './shared/components/toast/toast';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);
  private authService = inject(AuthService);

  constructor() {
    // Falha de Segurança "Reativa": Monitora o estado de autenticação globalmente
    effect(() => {
      const user = this.authService.currentUser();
      const isLoading = this.authService.isAuthLoading();

      // Se parou de carregar e não tem usuário, mas estamos numa rota que talvez precise...
      // O Guard já protege a entrada, mas se a sessão expirar com a tela aberta:
      if (!isLoading && !user) {
        // Verifica se a rota atual é pública (ex: login, cadastro)
        // Como o Router pode não estar pronto no primeiro tick, isso precisa ser robusto
        const currentUrl = this.router.url;
        const isPublicRoute = [
          '/entrar',
          '/cadastro',
          '/recuperar-senha',
          '/definir-nova-senha',
        ].some((route) => currentUrl.startsWith(route));

        if (!isPublicRoute && currentUrl !== '/') {
          this.router.navigate(['/entrar']);
        }
      }
    });
  }

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.viewportScroller.scrollToPosition([0, 0]);

      // Gerenciamento de foco para acessibilidade (a11y)
      // Tenta focar no H1 (título da página) ou no Main (conteúdo principal)
      const focusTarget = document.querySelector('h1') || document.querySelector('main');

      if (focusTarget) {
        const target = focusTarget as HTMLElement;
        target.setAttribute('tabindex', '-1'); // Permite focar em elementos não-interativos
        target.focus({ preventScroll: true }); // Foca sem scrollar novamente (já scrollamos pro topo)

        // Limpa o tabindex ao sair do foco para manter o fluxo natural
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  }
}
