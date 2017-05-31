import { NgModule }              from '@angular/core';
import { RouterModule, Routes }   from '@angular/router';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { PageNotFoundComponent } from './page-not-found.component';


const app_routes: Routes = [
  {
    path: '',
		component: MainMenuComponent,
    data: {
      pages:[
        {
          name:"writing",
          path:"/writing"
        },{
          name:"programming",
          path:"/programming"
        },{
          name:"photography",
          path:"/photography"
        },{
          name:"inspiration",
          path:"/inspiration"
        }
      ]
    }
  },{
    path: 'writing',
    component: MainMenuComponent,
    data: {
      pages:[
        {
          name:"philosophy",
          path:"/writing/philosophy"
        },{
          name:"criticism",
          path:"/writing/criticism"
        },{
          name:"modern lore",
          path:"/writing/modernlore"
        },{
          name:"ancient lore",
          path:"/writing/ancientlore"
        }
      ]
    }
  },{
    path: 'programming',
    component: MainMenuComponent,
    data: {
      pages:[
        {
          name:"apps",
          path:"/programming/apps"
        },{
          name:"articles",
          path:"/programming/articles"
        },{
          name:"github",
          path:"https://github.com/simian201",
          external:true
        },{
          name:"codepen",
          path:"https://codepen.io/simian201/pens/public/",
          external:true
        }
      ]
    }
  },{
    path: 'photography',
    component: MainMenuComponent
  },{
    path: 'inspiration',
    component: MainMenuComponent
  },{
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(app_routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}