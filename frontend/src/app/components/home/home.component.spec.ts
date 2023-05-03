import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { PlaylistService } from 'src/app/services/playlist.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

class MockPlayListService extends PlaylistService {
  createPlayList() {
    return {
      childFriendly: true,
      createdAt: '2023-05-01T14:02:15.255Z',
      description: null,
      id: 11,
      spotifyAccessToken: null,
      spotifyPlaylistId: '6fhNCRL0G73vnEJ88GET81',
      spotifyRefreshToken: null,
      spotifyTokenExpiresAt: null,
      title: 'test',
      updatedAt: '2023-05-01T14:02:15.255Z',
    };
  }
}
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let testBedService: PlaylistService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [PlaylistService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    TestBed.overrideComponent(HomeComponent, {
      set: {
        providers: [
          { provide: PlaylistService, useClass: MockPlayListService },
        ],
      },
    });
    // PlaylistService provided to the TestBed
    fixture = await TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    testBedService = TestBed.get(PlaylistService);
    let form = fixture.debugElement.query(By.css('form'));
    let btn = fixture.debugElement.query(By.css('button'));

    component = fixture.componentInstance;
    // );
  });

  it('Component should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Component should have a name', () => {
    expect(component.newPlaylistName).toBe('');
  });

  it('Component should have a childFriendly', () => {
    expect(component.childFriendly).toBeFalsy();
  });

  it('should create', () => {
    expect(component.createPlaylist).toBeTruthy();
  });
});
