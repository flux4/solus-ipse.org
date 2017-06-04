import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
{
  public header_hidden = false;
  public breadcrumbs = [];
  public breadcrumb_clicked = false;

  constructor (router: Router) {
    var bc = this.breadcrumbs;
    var bcc = this.breadcrumb_clicked;
    //this.breadcrumb_clicked = false;
    router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        var new_url = evt.url;
        // if returning home, clear all breacrumbs
        if (new_url === '' || new_url === '/') {
            bc.length = 0;
        } else {
          var c = evt.url.split('/');
          let name: string = c[c.length-1];
          let path: string = evt.url.substr(1);
          bc.push({name: name, path: path});
        }
      }
    });
  }
}
