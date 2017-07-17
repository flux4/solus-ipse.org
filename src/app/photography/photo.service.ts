import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PhotoService {

  private http: Http;

  constructor(http: Http)
  {
    this.http = http;
  }

  ngOnInit() {}


  getAlbumList(success, error) {
    var http = this.http;
    http.get('assets/photo_api_key.json')
              .map(res => res.json())
              .subscribe(data => this.getAlbumList2(data, success, error, http),
              err => error("error retrieving flickr albums"));
  }

  private getAlbumList2(photo_api_key, success, error, http: Http) {
      var album_list_url = "https://api.flickr.com/services/rest/?&method=flickr.photosets.getList&api_key="+photo_api_key.key+"&user_id=154623445@N05&format=json&nojsoncallback=1";
      http.get(album_list_url)
          .map(res => res.json())
          .subscribe(data => this.parseFlickrAlbumList(data, success, error),
          err => console.log(err));
  }

  private parseFlickrAlbumList(data, success, error) {
    var photosets = data.photosets.photoset;
    var r = [];
    for (var i=0; i<photosets.length; ++i) {
      var album_name = photosets[i].title._content;
      var album_id = photosets[i].id;
      r.push({
        "name":album_name,
        "id": album_id
      });
    }
    success(r);
  }


  getAlbumPhotos(album_id, success, error) {
    var http = this.http;
    http.get('assets/photo_api_key.json')
              .map(res => res.json())
              .subscribe(data => this.getAlbumPhotos2(data, album_id, success, error, http),
              err => error(err));
  }

  private getAlbumPhotos2(api_key, album_id, success, error, http) {
    var album_url = "https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key="+api_key.key+"&photoset_id="+album_id+"&extras=url_l&format=json&nojsoncallback=1";
    http.get(album_url)
          .map(res => res.json())
          .subscribe(data => this.parseFlickrAlbum(data, api_key, album_id, success, error, http),
          err => error(err));
  }

  private parseFlickrAlbum(flickr_album_data, api_key, album_id, success, error, http) {
    var p = flickr_album_data.photoset.photo
    console.log(p);
    var r = [];
    for (var i=0; i<p.length; ++i) {
      r.push({
        "width":p[i].width_l,
        "height":p[i].height_l,
        "url":p[i].url_l
      });
    }
    success({
      "photos":r
    });
  }
}
