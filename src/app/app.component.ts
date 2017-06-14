import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { HeaderAnimation } from './header.animation'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [HeaderAnimation]
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
        var i = 0;
        for (; i<url.length; ++i) {

          if (i > 0) path += '/';
          var path_part = url[i].path;
          var bc_id = 'breadcrumb_'+path_part;
          path += path_part;

          // look through the router to find the title for this path
          var title = '';
          for (var j=0; j<this.router.config.length; ++j) {
            var rj = this.router.config[j];
            if (rj.path === path
                && rj.hasOwnProperty('data')
                && rj.data.hasOwnProperty('title')) {
              title = rj.data.title;
            }
          }

          // if there's no title found in the router
          // just use the portion of the path
          if (title === '') title = path_part;

          // special case for photography
          // all album ids are the same length
          if (path.indexOf('photography') >= 0 && title != 'photography') {
            bc_id = 'breadcrumb_photography_album';
          }

          if (i < this.breadcrumbs.length) {
            if (this.breadcrumbs[i].title != title || this.breadcrumbs[i].path != path) {
              this.breadcrumbs = this.breadcrumbs.slice(0,i);
              this.breadcrumbs.push({
                id: bc_id,
                title: title,
                path: path
              });
            }
          } else {
            this.breadcrumbs.push({
              id: bc_id,
              title: title,
              path: path
            });
          }
        }
        if (i < this.breadcrumbs.length) {
          this.breadcrumbs = this.breadcrumbs.slice(0,i);
        }
      }
    });
  }
}
