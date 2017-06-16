import { Component, OnInit, NgZone, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from './photo.service';

@Component({
  selector: 'app-photography-album',
  templateUrl: './photography-album.component.html',
  styleUrls: ['./photography-album.component.css'],
  providers: [PhotoService],
  host: {
    '(document:keydown)': 'keyDown($event.keyCode)',
  }
})

export class PhotographyAlbumComponent implements OnInit {

  private route: ActivatedRoute;
  private photo_service: PhotoService;
  public photos = [{url:"", width:0, height:0}];
  public error_message = null;

  public img_width;
  public img_height;
  public current_photo=0;

  keyDown(key_code) {
    if (key_code == 37) { // left
      this.current_photo--;
      if (this.current_photo < 0) {
        this.current_photo = this.photos.length-1;
      }
      this.fitImage();
    } else if (key_code == 39) { // right
      this.current_photo++;
      if (this.current_photo == this.photos.length) {
        this.current_photo = 0;
      }
      this.fitImage();
    }
  }

  fitImage() {
    var img_width = this.photos[this.current_photo].width;
    var img_height = this.photos[this.current_photo].height;
    var div_width = document.body.offsetWidth;// this.component_element.nativeElement.offsetWidth;
    var div_height = document.body.offsetHeight;// this.component_element.nativeElement.offsetHeight;
    var img_aspect = img_width / img_height;
    var div_aspect = div_width / div_height;
    if (img_aspect > div_aspect) {
      this.img_width = div_width
      this.img_height = div_width / img_aspect
    } else {
      this.img_width = div_height * img_aspect
      this.img_height = div_height;
    }
    console.log(this.img_width);
    console.log(this.img_height);
  }

  private ngzone: NgZone;
  private component_element: ElementRef;

  constructor(route: ActivatedRoute, photo_service: PhotoService, ngzone: NgZone, component_element: ElementRef) {
    this.route = route;
    this.photo_service = photo_service;
    this.ngzone = ngzone;
    this.component_element = component_element;
  }

  ngOnInit() {
    var album_id = this.route.snapshot.params['id'];
    this.photo_service.getAlbumPhotos(album_id,
      (data) => {
        this.photos = data.photos;
        this.current_photo = 0;
        this.fitImage()
      },
      (err) => {
        this.error_message = "error loading flickr albums";
        console.log(err);
      }
    );

    window.onresize = (e) => {
        this.ngzone.run(() => {
          this.fitImage();
        });
    };
  }

}
