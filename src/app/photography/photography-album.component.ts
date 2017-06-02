import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from './photo.service';

@Component({
  selector: 'app-photography-album',
  templateUrl: './photography-album.component.html',
  styleUrls: ['./photography-album.component.css'],
  providers: [PhotoService]
})

export class PhotographyAlbumComponent implements OnInit {

  private route: ActivatedRoute;
  private photo_service: PhotoService;
  public album = null;
  public error_message = null;

  public img_width=0;
  public img_height=0;

  

  constructor(route: ActivatedRoute, photo_service: PhotoService) {
    this.route = route;
    this.photo_service = photo_service;
  }

  ngOnInit() {
    var album_id = this.route.snapshot.params['id'];
    this.photo_service.getAlbumDetails(album_id,
      (data) => {
        this.album = data;
        this.img_width = document.body.offsetWidth;
        this.img_height = document.body.offsetHeight;
      },
      (err) => {
        this.error_message = "error loading flickr albums";
        console.log(err);
      }
    );
  }

}
