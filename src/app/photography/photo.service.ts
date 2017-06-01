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

  ngOnInit() {
    /*var temp = this.http.get('assets/flickr.json')
      //.map((response: Response) => {
      //  this.temp_message = response.json();
      //})
      .map(this.parseResponse)
      .catch((error: any, caught:Observable<any>) => {
        this.temp_message = "error retrieving flickr albums";
        console.log('!!');
        return null;
      });
    console.log(temp);*/


  }
  /*recieveApiKey(data) {

  }*/


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


  getAlbumDetails(album_id, success, error) {
    var http = this.http;
    http.get('assets/photo_api_key.json')
              .map(res => res.json())
              .subscribe(data => this.getAlbumDetails2(data, album_id, success, error, http),
              err => error(err));
  }

  private getAlbumDetails2(api_key, album_id, success, error, http) {
    var album_url = "https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key="+api_key.key+"&photoset_id="+album_id+"&format=json&nojsoncallback=1";
    http.get(album_url)
          .map(res => res.json())
          .subscribe(data => this.parseFlickrAlbum(data, api_key, album_id, success, error, http),
          err => error(err));
  }

  private parseFlickrAlbum(flickr_album_data, api_key, album_id, success, error, http) {
    var photo_id = flickr_album_data.photoset.photo[0].id;
    var album_name = flickr_album_data.photoset.title;
    var get_sizes_url = "https://api.flickr.com/services/rest/?&method=flickr.photos.getSizes&api_key=70967cdf22e2f49334dda8d0344c2a96&photo_id="+photo_id+"&format=json&nojsoncallback=1";
    http.get(get_sizes_url)
          .map(res => res.json())
          .subscribe(data => this.parseSizes(data, album_name, api_key, album_id, success, error),
          err => error(err));
  }


  private parseSizes(size_data, album_name, api_key, album_id, success, error) {
    var fpu = size_data.sizes.size[size_data.sizes.size.length-2].source;
    success({
      "id":album_id,
      "name":album_name,
      "first_photo_url": fpu
    });
  }






}
