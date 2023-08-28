import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-share-session',
  templateUrl: './share-session.component.html',
  styleUrls: ['./share-session.component.css'],
})
export class ShareSessionComponent {
  playlistId = '';
  constructor(private router: Router, private route: ActivatedRoute) {}
  async ngOnInit(): Promise<void> {
    console.log(this.route.snapshot.paramMap);

    this.playlistId =
      this.route.snapshot.paramMap.get('spotifyPlaylistId') || '';
  }
  redirectToPlaylistComponent() {
    if (this.playlistId.length > 0) {
      this.router.navigate(['/playlist', this.playlistId]);
    }
  }
}
