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
              .subscribe(data => this.receiveApiKey(data, success, error, http),
              err => error("error retrieving flickr albums"));
  }

  receiveApiKey(photo_api_key, success, error, http: Http) {
      var album_list_url = "https://api.flickr.com/services/rest/?&method=flickr.photosets.getList&api_key="+photo_api_key.key+"&user_id=154623445@N05&format=json&nojsoncallback=1";//&jsoncallback=JSON_CALLBACK";
      http.get(album_list_url)
          .map(res => res.json())
          .subscribe(data => this.parseFlickrAlbumList(data, success, error),
          err => console.log(err));
  }

  parseFlickrAlbumList(data, success, error) {
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

}
