import { Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-share-session',
  templateUrl: './share-session.component.html',
  styleUrls: ['./share-session.component.css'],
})
export class ShareSessionComponent {
  playlistId = '';
  playlistUrl = environment.clientUrl + '/playlist/' + this.playlistId;
  isCopiedToClipboard = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipboard: Clipboard
  ) {}
  async ngOnInit(): Promise<void> {
    this.playlistId =
      this.route.snapshot.paramMap.get('spotifyPlaylistId') || '';
  }
  redirectToPlaylistComponent() {
    if (this.playlistId.length > 0) {
      this.router.navigate(['/playlist', this.playlistId]);
    }
  }

  copyToClipboard(tooltip: any) {
    this.clipboard.copy(this.playlistId);
    this.isCopiedToClipboard = true;
    tooltip.show();
    setTimeout(() => {
      this.isCopiedToClipboard = false;
    }, 3000);
    setTimeout(() => {
      tooltip.hide();
    }, 1000);
  }
}
