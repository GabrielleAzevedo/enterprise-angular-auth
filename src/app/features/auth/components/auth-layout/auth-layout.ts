import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card';
import { LogoComponent } from "../../../../shared/components/logo/logo";

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CardComponent, LogoComponent],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {

}
