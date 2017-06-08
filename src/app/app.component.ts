import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
{
  public header_hidden = false;
  public breadcrumbs = [];

  private router: Router;
  private activated_route: ActivatedRoute;

  constructor (router: Router, activated_route: ActivatedRoute) {
    this.router = router;
    this.activated_route = activated_route;
    router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        var url = this.activated_route.firstChild.snapshot.url;
        var path = '';
        this.breadcrumbs = [];
        for (var i=0; i<url.length; ++i) {
          if (i > 0) path += '/';
          path += url[i].path;
          var title = '';
          for (var j=0; j<this.router.config.length; ++j) {
            var rj = this.router.config[j];
            if (rj.path === path
                && rj.hasOwnProperty('data')
                && rj.data.hasOwnProperty('title')) {
              title = rj.data.title;
            }
          }
          if (title === '') title = url[i].path;
          this.breadcrumbs.push({
            title: title,
            path: path
          })
        }
      }
    });
  }
}
