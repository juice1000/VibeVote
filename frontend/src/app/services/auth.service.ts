import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expirationTime: number | null = null;
  URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['accessToken']) {
        this.accessToken = params['accessToken'];
        console.log(this.accessToken, 'ACCESSTOKEN ACQUIRED!!');
      }
      if (params['refreshToken']) {
        this.refreshToken = params['refreshToken'];
        console.log(this.refreshToken, 'REFRESHTOKEN ACQUIRED!!');
      }
      if (params['expiresIn']) {
        const expiresIn = parseInt(params['expiresIn'], 10);
        this.expirationTime = Date.now() + expiresIn * 1000;
      }
    });
  }

  loginWithSpotify() {
    const scope =
      'user-read-email user-read-private playlist-modify-private playlist-modify-public';
    const responseType = 'code';
    const authUrl = `http://localhost:3000/auth/spotify?scope=${scope}&response_type=${responseType}`;
    window.location.href = authUrl;
  }

  getAccessToken() {
    return this.accessToken;
  }
  getRefreshToken() {
    return this.refreshToken;
  }
  getExpirationTime() {
    return this.expirationTime;
  }

  isTokenExpired(): boolean {
    if (!this.expirationTime) {
      return true;
    }
    return Date.now() >= this.expirationTime;
  }

  setAccessToken(accessToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.expirationTime = Date.now() + expiresIn * 1000;
  }

  async refreshAccessToken(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      const response: any = await this.http
        .post(`${this.URL}/auth/refresh`, { refreshToken })
        .toPromise();
      const newAccessToken = response['accessToken'];
      const expiresIn = response['expiresIn'];
      this.setAccessToken(newAccessToken, expiresIn);
    } catch (error) {
      console.error('Failed to refresh access token', error);
      throw error;
    }
  }
}
