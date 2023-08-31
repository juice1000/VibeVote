import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { HomeComponent } from './components/home/home.component';
import { ShareSessionComponent } from './components/share-session/share-session.component';
import { JoinSessionComponent } from './components/join-session/join-session.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'share-session/:spotifyPlaylistId',
    component: ShareSessionComponent,
  },
  {
    path: 'join-session',
    component: JoinSessionComponent,
  },
  { path: 'playlist/:spotifyPlaylistId', component: PlaylistComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
