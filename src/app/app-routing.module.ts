import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { PhotographyComponent } from './photography/photography.component';
import { PhotographyAlbumComponent } from './photography/photography-album.component';
import { ApaxComponent } from './apax/apax.component';
import { KybosComponent } from './kybos/kybos.component';

const app_routes: Routes = [
  {
    path: '',
		component: MainMenuComponent,
    data: {
      menu:[
        {
          name:"programming",
          path:"/programming"
        },{
          name:"photography",
          path:"/photography"
        }
      ]
    }
  },{
    path: 'programming',
    component: MainMenuComponent,
    data: {
      title: 'programming',
      menu:[
        {
          name:"apps",
          path:"/programming/apps"
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
    path: 'programming/apps',
    component: MainMenuComponent,
    data: {
      title: 'apps',
      menu:[
        {
          name:'apax',
          path:'/programming/apps/apax'
        }
      ]
    }
  },{
    path: 'programming/apps/apax',
    component: ApaxComponent,
    data: {
      title: 'apax'
    }
  },{
    path: 'programming/apps/kybos',
    component: KybosComponent,
    data: {
      title: 'kybos'
    }
  },{
    path: 'photography',
    component: PhotographyComponent,
    data: {
      title: 'photography'
    }
  },{
    path: 'photography/:id',
    component: PhotographyAlbumComponent,
    data: {
      title: 'photography_album'
    }
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