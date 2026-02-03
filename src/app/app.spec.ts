import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './core/services';
import { vi } from 'vitest';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: vi.fn().mockReturnValue(null),
            isAuthLoading: vi.fn().mockReturnValue(false),
            initSession: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
