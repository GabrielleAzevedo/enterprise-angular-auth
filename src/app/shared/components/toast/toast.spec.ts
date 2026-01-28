import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast';
import { ToastService } from '../../../core/services/toast/toast.service';
import { By } from '@angular/platform-browser';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir toasts quando adicionados ao serviço', () => {
    toastService.show('Teste Visual', 'success');
    fixture.detectChanges();

    const toastElements = fixture.debugElement.queryAll(By.css('.shadow-lg'));
    expect(toastElements.length).toBe(1);
    expect(toastElements[0].nativeElement.textContent).toContain('Teste Visual');
  });

  it('deve aplicar classes corretas para tipo success', () => {
    toastService.success('Sucesso');
    fixture.detectChanges();

    const toastEl = fixture.debugElement.query(By.css('.shadow-lg')).nativeElement;
    expect(toastEl.classList).toContain('border-green-500');
    expect(toastEl.classList).toContain('text-green-700');
  });

  it('deve aplicar classes corretas para tipo error', () => {
    toastService.error('Erro');
    fixture.detectChanges();

    const toastEl = fixture.debugElement.query(By.css('.shadow-lg')).nativeElement;
    expect(toastEl.classList).toContain('border-red-500');
    expect(toastEl.classList).toContain('text-red-700');
  });

  it('deve remover toast ao clicar no botão fechar', () => {
    toastService.show('Para Fechar', 'info');
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(By.css('button'));
    closeBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(toastService.toasts().length).toBe(0);
  });
});
