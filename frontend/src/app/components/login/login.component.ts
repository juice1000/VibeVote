import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  sessionId!: string;

  constructor(private router: Router) {}

  joinSession(): void {
    this.router.navigate(['/playlist', this.sessionId]);
  }
}
