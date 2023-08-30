import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../environments/environment';

const URL = environment.serverUrl;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  accessToken = this.authService.getAccessToken();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private socket: Socket,
    private router: Router
  ) {}

  async createUser(userId: string, userName: string): Promise<any> {
    const response = await firstValueFrom(
      this.http.post(`${URL}/api/user/create`, {
        userId,
        userName,
      })
    );
    return response;
  }
}
