import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { vi } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve iniciar com lista vazia', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('deve adicionar um toast com show()', () => {
    service.show('Teste de mensagem', 'info');
    
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Teste de mensagem');
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].id).toBeDefined();
  });

  it('deve adicionar toast de sucesso', () => {
    service.success('Sucesso!');
    const toast = service.toasts()[0];
    expect(toast.type).toBe('success');
    expect(toast.message).toBe('Sucesso!');
  });

  it('deve adicionar toast de erro', () => {
    service.error('Erro!');
    const toast = service.toasts()[0];
    expect(toast.type).toBe('error');
    expect(toast.message).toBe('Erro!');
  });

  it('deve remover um toast pelo id', () => {
    service.show('Toast 1');
    const id1 = service.toasts()[0].id;
    service.show('Toast 2');

    expect(service.toasts().length).toBe(2);

    service.remove(id1);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Toast 2');
  });

  it('deve remover automaticamente após a duração', () => {
    service.show('Auto remove', 'info', 1000);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1000); // Avança o tempo em 1s

    expect(service.toasts().length).toBe(0);
  });

  it('não deve remover automaticamente se duração for 0', () => {
    service.show('Fixo', 'info', 0);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(5000);

    expect(service.toasts().length).toBe(1);
  });
});