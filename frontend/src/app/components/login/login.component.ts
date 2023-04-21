import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  sessionId!: string;

  constructor(private router: Router, private authService: AuthService) {}

  joinSession(): void {
    this.router.navigate(['/playlist', this.sessionId]);
  }

  loginWithSpotify(): void {
    this.authService.loginWithSpotify();
  }
}
