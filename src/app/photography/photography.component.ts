import { Component, OnInit } from '@angular/core';
import { PhotoService } from './photo.service';
import { FadeAnimation } from '../fade.animation';


@Component({
  selector: 'app-photography',
  templateUrl: './photography.component.html',
  styleUrls: ['./photography.component.css'],
  providers: [PhotoService],
  animations: [FadeAnimation],
  host: { '[@routerTransition]': 'true' }
})

export class PhotographyComponent implements OnInit
{

  private photo_service;
  public error_message = null;
  public albums;

  constructor(photo_service: PhotoService)
  {
    this.photo_service = photo_service;
  }

  ngOnInit()
  {
    this.photo_service.getAlbumList(
      (data) =>
      {
        this.albums = data;
        this.albums.sort(function(a, b)
        {
          return -(a.name.localeCompare(b.name));
        });
      },
      (err) =>
      {
        this.error_message = "error loading flickr albums";
        console.log(err);
      }
    );
  }
}
