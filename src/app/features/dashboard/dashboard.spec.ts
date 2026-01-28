import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: vi.fn().mockReturnValue({ email: 'test@example.com' }), // Signal mock
      signOut: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, LucideAngularModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o email do usuário logado', () => {
    // Procura o elemento p com as classes específicas
    const emailElement =
      fixture.debugElement.nativeElement.querySelector('p.text-muted-foreground');
    // Adiciona verificação se elemento existe antes de acessar textContent
    if (emailElement) {
      expect(emailElement.textContent).toContain('test@example.com');
    } else {
      // Fallback: se mudou a classe, procura pelo texto
      const textContent = fixture.debugElement.nativeElement.textContent;
      expect(textContent).toContain('test@example.com');
    }
  });

  it('deve fazer logout e redirecionar para login', async () => {
    await component.logout();

    expect(authServiceMock.signOut).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/entrar']); // Ajustado para rota correta
  });
});