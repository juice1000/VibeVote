import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
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
    });
  }

  loginWithSpotify() {
    const scope = 'user-read-email user-read-private';
    const responseType = 'code';
    const authUrl = `http://localhost:3000/auth/spotify?scope=${scope}&response_type=${responseType}`;
    window.location.href = authUrl;
  }

  getAccessToken() {
    return this.accessToken;
  }
}
