import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastComponent } from './shared/components/toast/toast';

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
