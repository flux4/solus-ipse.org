import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographyAlbumComponent } from './photography-album.component';

describe('PhotographyAlbumComponent', () => {
  let component: PhotographyAlbumComponent;
  let fixture: ComponentFixture<PhotographyAlbumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotographyAlbumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotographyAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
