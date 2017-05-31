import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})

export class MainMenuComponent implements OnInit {
  
  sub: any;
  route: any;
  pages = [];

  constructor(route: ActivatedRoute)
  {
    this.route = route;
  }

  ngOnInit() {
    var pages = this.pages;
    this.sub = this.route.data.subscribe(v => {
      pages.length = 0;
      for (var i=0; i<v.pages.length; ++i) {
        pages.push({name:v.pages[i].name,
                    path:v.pages[i].path,
                    external:v.pages[i].external});
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}