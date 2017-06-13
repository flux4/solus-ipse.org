import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { FadeAnimation } from '../fade.animation';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
  animations: [FadeAnimation],
  host: { '[@routerTransition]': 'true' }
})

export class MainMenuComponent implements OnInit {

  sub: any;
  route: any;
  public menu = [];

  constructor(route: ActivatedRoute)
  {
    this.route = route;
  }

  ngOnInit() {
    this.sub = this.route.data.subscribe(v => {
      this.menu = v.menu;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}