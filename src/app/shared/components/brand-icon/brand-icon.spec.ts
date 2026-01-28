import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrandIconComponent } from './brand-icon';
import { By } from '@angular/platform-browser';

describe('BrandIconComponent', () => {
  let component: BrandIconComponent;
  let fixture: ComponentFixture<BrandIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BrandIconComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o SVG do Google quando name="google"', () => {
    fixture.componentRef.setInput('name', 'google');
    fixture.detectChanges();

    const svgElement = fixture.debugElement.query(By.css('svg'));
    expect(svgElement).toBeTruthy();
    expect(svgElement.nativeElement.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  // Teste futuro para quando tiver mais ícones (ex: facebook)
  // it('não deve renderizar nada se o nome for inválido/vazio', () => {
  //   // @ts-ignore
  //   component.name = 'invalid';
  //   fixture.detectChanges();
  //   const svgElement = fixture.debugElement.query(By.css('svg'));
  //   expect(svgElement).toBeNull();
  // });
});
