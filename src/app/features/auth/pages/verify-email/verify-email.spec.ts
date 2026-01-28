import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyEmailComponent } from './verify-email';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let routerMock: any;
  let routeMock: any;

  beforeEach(async () => {
    routerMock = {
      navigate: vi.fn(),
      getCurrentNavigation: vi.fn().mockReturnValue({ extras: { state: {} } }), // Adiciona o mock faltante
    };

    routeMock = {}; // ActivatedRoute vazio, pois só é preciso se formos ler params

    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir email do estado da navegação se disponível', () => {
    // Simula retorno do router com estado
    routerMock.getCurrentNavigation.mockReturnValue({
      extras: {
        state: {
          email: 'test@example.com',
        },
      },
    });

    // Recria componente para pegar o novo estado
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const emailElement = fixture.debugElement.query(By.css('span.text-primary'));
    expect(emailElement.nativeElement.textContent).toContain('test@example.com');
  });

  it('deve exibir email padrão se não houver estado', () => {
    // Simula estado vazio
    Object.defineProperty(history, 'state', {
      value: {},
      writable: true,
    });

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const emailElement = fixture.debugElement.query(By.css('span.text-primary'));
    expect(emailElement.nativeElement.textContent).toContain('seu endereço de email');
  });

  it('deve ter o link correto para login', () => {
    const button = fixture.debugElement.query(By.css('app-button'));
    expect(button.attributes['routerLink']).toBe('/entrar');
  });
});
