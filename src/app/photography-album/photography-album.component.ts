import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-photography-album',
  templateUrl: './photography-album.component.html',
  styleUrls: ['./photography-album.component.css']
})

export class PhotographyAlbumComponent implements OnInit {

  private route: ActivatedRoute;
  private album_id;

  constructor(route: ActivatedRoute) {
    this.route = route;
  }

  ngOnInit() {
    this.album_id = this.route.snapshot.params['id'];
    console.log(this.album_id);
  }

}
