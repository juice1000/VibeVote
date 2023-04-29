import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { PlaylistService } from 'src/app/services/playlist.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

class MockPlayListService extends PlaylistService {
  createPlayList() {
    return { spotifyPlayListId: '1234' };
  }
}
fdescribe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let testBedService: PlaylistService;
  // let componentService: PlaylistService;

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
    // AuthService provided to the TestBed
    testBedService = TestBed.get(PlaylistService);

    // AuthService provided by Component, (should return MockAuthService)
    // componentService = fixture.debugElement.injector.get(PlaylistService);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Service injected via inject(...) and TestBed.get(...) should be the same instance', inject(
    [PlaylistService],
    (injectService: PlaylistService) => {
      expect(injectService).toBe(testBedService);
    }
  ));

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
  // it('should create playlist', (done) => {
  //   let object = { spotifyPlayListId: '1234' };
  //   spyOn(component, 'createPlaylist');
  //   expect(component.createPlaylist).toHaveBeenCalledWith();

  //   // component.createPlaylist();
  //   // let result = await testBedService.createPlaylist('name', false);
  //   // expect(result.toEqual({ spotifyPlayListId: '1234' }));
  //   // expect
  // });
});
