import { Component } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Router } from '@angular/router';
import { ScannerQRCodeResult } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.css'],
})
export class JoinSessionComponent {
  playlistId!: string;
  scannerOpen = false;
  constructor(
    private playlistService: PlaylistService,
    private router: Router
  ) {}

  startScanner() {
    this.scannerOpen = true;
  }
  closeScanner() {
    this.scannerOpen = false;
  }

  async onScan($event: ScannerQRCodeResult[], action?: any) {
    console.log($event[0].value);
    $event && action && action.stop();
    this.closeScanner();

    this.playlistId = $event[0].value;
    this.redirectToPlaylist();
  }

  async redirectToPlaylist() {
    // example playlist Id: 1pQhXVaS08YJ0WDApUWYjk

    if (this.playlistId) {
      // sanitize input
      const re = new RegExp('[a-zA-Z0-9]{22}');
      const res = this.playlistId.match(re);
      console.log(res);

      if (res && res[0] === this.playlistId) {
        // check if playlist exists + check if playlist active
        const isActive = await this.playlistService.isActivePlaylist(
          this.playlistId
        );
        if (isActive) {
          this.playlistService.userJoins(this.playlistId);
          // redirect
          this.router.navigate(['/playlist', this.playlistId]);
        } else {
          alert(`Seems like this Party is not active right now`);
        }
      } else {
        alert(`Seems like you didn't enter a valid playlist Id`);
      }
    }
  }
}
