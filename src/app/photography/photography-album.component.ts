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
  private album = null;
  private error_message = null;

  constructor(route: ActivatedRoute, photo_service: PhotoService) {
    this.route = route;
    this.photo_service = photo_service;
  }

  ngOnInit() {
    var album_id = this.route.snapshot.params['id'];
    this.photo_service.getAlbumDetails(album_id,
      (data) => {
        this.album = data;
      },
      (err) => {
        this.error_message = "error loading flickr albums";
        console.log(err);
      }
    );
  }

}
