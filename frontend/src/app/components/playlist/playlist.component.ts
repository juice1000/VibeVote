import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { PlayerService } from 'src/app/services/player.service';
import { AddTrackComponent } from '../add-track/add-track.component';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  playlist: any;
  isOwner = false;
  userVotes: boolean[] = [];
  addTrackVisible = false;
  currentTrackId = '';

  @ViewChild(AddTrackComponent) addTrackComponent!: AddTrackComponent;
  @Output() sessionExpired = false;
  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private playerService: PlayerService,
    private changeDetector: ChangeDetectorRef,
    private socket: Socket
  ) {}

  async ngOnInit(): Promise<void> {
    const spotifyPlaylistId: any =
      this.route.snapshot.paramMap.get('spotifyPlaylistId');

    this.isOwner = await this.playlistService.isOwner(spotifyPlaylistId);
    console.log('is the playlist owner: ', this.isOwner);

    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId,
        false
      );
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
    this.socket.on('sessionExpired', (playlistId: string) => {
      if (spotifyPlaylistId === playlistId) {
        this.sessionExpired = true;
      }
    });
    this.socket.on(
      'voteCountUpdated',
      async ({ playlistId }: { playlistId: string }) => {
        if (playlistId === this.playlist.spotifyPlaylistId) {
          this.playlist = await this.playlistService.getPlaylistBySpotifyId(
            playlistId,
            false
          );
          await this.playlistService.markTracksAsPlayed(
            this.playlist,
            this.currentTrackId
          );
          await this.playlistService.updatePlaylistOrder(playlistId);
        }

        this.changeDetector.detectChanges();
      }
    );
    this.socket.on('TrackListUpdated', async (playlistId: string) => {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        playlistId,
        false
      );

      this.changeDetector.detectChanges();
    });
    this.socket.on('stateChange', async (playlistId: string) => {
      if (this.playlist.spotifyPlaylistId === playlistId) {
        await this.playlistService.markTracksAsPlayed(
          this.playlist,
          this.currentTrackId
        );
        await this.playlistService.updatePlaylistOrder(playlistId);
        this.playlist = await this.playlistService.getPlaylistBySpotifyId(
          playlistId,
          false
        );
      }

      this.changeDetector.detectChanges();
    });
  }

  async fetchPlaylistBySpotifyId(spotifyPlaylistId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId,
        false
      );
    } catch (error) {
      console.error('Failed to fetch playlist', error);
    }
  }

  async vote(
    trackId: string,
    spotifyId: string,
    index: number,
    playlistId: string
  ): Promise<void> {
    const isActive = await this.playlistService.isActivePlaylist(playlistId);

    if (!isActive) {
      this.sessionExpired = true;
    } else {
      try {
        const spotifyPlaylistId =
          this.route.snapshot.paramMap.get('spotifyPlaylistId');

        await this.playlistService.voteForTrack(
          spotifyPlaylistId!,
          trackId,
          spotifyId
        );
      } catch (error) {
        console.error('Failed to vote for track', error);
      }
    }
  }

  async addTrack(playlistId: string): Promise<void> {
    const isActive = await this.playlistService.isActivePlaylist(playlistId);

    if (!isActive) {
      this.sessionExpired = true;
    } else {
      this.addTrackVisible = true;
    }
  }

  async removePlaylist(playlistId: string): Promise<void> {
    console.log('called removePlaylist');
    // if (this.isOwner) {
    //   console.log(this.playlist.state);
    //   this.playlist.state = null;
    // }
    this.playerService.disconnectPlayer();
    this.playlistService.removePlaylist(playlistId, this.isOwner);
  }

  async leaveSession(playlistId: string) {
    console.log('called leaveSession');
    // if (this.isOwner) {
    //   console.log(this.playlist.state);
    //   this.playlist.state = null;
    // }
    this.playerService.disconnectPlayer();
    this.playlistService.leaveSession(playlistId, this.isOwner);
  }

  async onAddTrackModalClose(searchResult: string | null): Promise<void> {
    this.addTrackVisible = false;

    if (searchResult) {
      const spotifyPlaylistId =
        this.route.snapshot.paramMap.get('spotifyPlaylistId');
      try {
        await this.playlistService.addTrackToPlaylist(
          spotifyPlaylistId!,
          searchResult
        );
        this.playlist = await this.playlistService.updatePlaylistOrder(
          spotifyPlaylistId!
        );

        await this.fetchPlaylistBySpotifyId(spotifyPlaylistId!);
      } catch (error) {
        console.error('Failed to add track to playlist', error);
      }
    }
  }

  async copyUrlToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL', error);
      alert('Failed to copy URL');
    }
  }
}
