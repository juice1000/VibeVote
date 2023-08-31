import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { AddTrackComponent } from './components/add-track/add-track.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { HomeComponent } from './components/home/home.component';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlayerComponent } from './components/player/player.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { InformationWindowComponent } from './components/information-window/information-window.component';
import { environment } from './../environments/environment';
import { ShareSessionComponent } from './components/share-session/share-session.component';
import { QRCodeModule } from 'angularx-qrcode';
import { PlaylistCardComponent } from './components/playlist-card/playlist-card.component';
import { JoinSessionComponent } from './components/join-session/join-session.component';
import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';

const config: SocketIoConfig = { url: environment.serverUrl, options: {} };
LOAD_WASM().subscribe((res: any) => console.log('LOAD_WASM', res));

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PlaylistComponent,
    AddTrackComponent,
    HomeComponent,
    PlayerComponent,
    InformationWindowComponent,
    ShareSessionComponent,
    PlaylistCardComponent,
    JoinSessionComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatDialogModule,
    MatListModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    MatSlideToggleModule,
    QRCodeModule,
    NgxScannerQrcodeModule,
    SocketIoModule.forRoot(config),
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
