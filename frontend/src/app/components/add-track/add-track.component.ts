import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-add-track',
  templateUrl: './add-track.component.html',
  styleUrls: ['./add-track.component.css'],
})
export class AddTrackComponent {
  trackName!: string;
  searchResults: any;

  constructor(
    public dialogRef: MatDialogRef<AddTrackComponent>,
    private playlistService: PlaylistService
  ) {}

  searchTracks(): void {
    this.playlistService.searchTracks(this.trackName).subscribe((results) => {
      this.searchResults = results;
    });
  }

  selectTrack(uri: string): void {
    this.dialogRef.close(uri);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
