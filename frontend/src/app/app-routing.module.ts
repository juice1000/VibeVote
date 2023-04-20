import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PlaylistComponent } from './components/playlist/playlist.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'playlist/:id', component: PlaylistComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
