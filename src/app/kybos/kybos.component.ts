import { Component, OnInit, NgZone } from '@angular/core';


class Hypercube {
  
}


class Transform {

  public angle:number;
  private cos_angle:number;
  private sin_angle:number;
  public index_i: number;
  public index_j: number;

  public animate: number; // -1, 0, 1
  public goal_angle: number;
  public angle_index: number;

  constructor(a:number, i:number, j:number) {
    this.angle = a;
    this.index_i = i;
    this.index_j = j;
    this.update();

    this.animate = 0;
    this.goal_angle = 0;
    this.angle_index = 0;
  }
  update() {
    this.cos_angle = Math.cos(this.angle);
    this.sin_angle = Math.sin(this.angle);
  }
  transform(p:number[]) {
    var pi = p[this.index_i]*this.cos_angle - p[this.index_j]*this.sin_angle;
    var pj = p[this.index_i]*this.sin_angle + p[this.index_j]*this.cos_angle;
    p[this.index_i] = pi;
    p[this.index_j] = pj;
  }
}





@Component({
  selector: 'app-kybos',
  templateUrl: './kybos.component.html',
  styleUrls: ['./kybos.component.css']
})
export class KybosComponent implements OnInit {

  private mp = {
    n_dimensions: 4,
    n_divisions: 8,
    speed: 10,
    accentuation: 95,
    line_width: 1
  };

  private transforms: Transform[];
  private obj_pts: number[][];
  private screen_pts: number[][];
  private cnv: HTMLCanvasElement;

  private ngzone: NgZone;

  constructor(ngzone: NgZone) {
    this.ngzone = ngzone;
  }
  refreshCanvasDimensions() {
    var cmain: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('cmain');
    cmain.width  = cmain.clientWidth;
    cmain.height = cmain.clientHeight;
  }

  ngOnInit() {
    this.refreshCanvasDimensions();
    window.onresize = (e) => {
        this.ngzone.run(() => {
          this.refreshCanvasDimensions();
        });
    };
  }

  setDimensions(n) {
    this.mp.n_dimensions = n;
  }
  setDivisions(n_divisions) {
    this.mp.n_divisions = Math.pow(2,n_divisions);
  }
  setSpeed(speed) {
    this.mp.speed = speed;
  }
  setAccentuation(accentuation) {
    this.mp.accentuation = accentuation;
  }
  setLineWidth(line_width) {
    this.mp.line_width = line_width;
  }


  wrapAngle(a) {
    var pi2 = Math.PI*2;
		while (a < 0) {
			a += pi2;
		}
		while (a > pi2) {
			a -= pi2;
		}
		return a;
	}

  randomizeAngles() {
    for (var i=0; i<this.transforms.length; ++i) {
      this.transforms[i].angle = Math.random()*Math.PI*2.0;
      this.transforms[i].update();
    }
    this.draw();
  }

  createHypercube() {

  }

  draw() {

    let ctx = this.cnv.getContext('2d');
    ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

    let speed:number = this.mp.speed;
    let n_divisions:number = this.mp.n_divisions;
    let accentuation:number = this.mp.accentuation;

    for (var i=0; i<this.transforms.length; ++i) {
      let trn: Transform = this.transforms[i];

      // update movement toward goal angle
      if (trn.goal_angle != -1) {
        trn.angle += (trn.goal_angle - trn.angle)*speed*10;
        if (Math.abs(trn.angle-trn.goal_angle) < 0.01) {
          trn.angle = trn.goal_angle;
          trn.goal_angle = -1;
        }
        trn.update();
      }

      if (trn.animate != 0) {

        var ps = speed + speed*Math.sin(trn.angle*n_divisions-Math.PI/2)*accentuation;
        trn.angle = this.wrapAngle(trn.angle + ps);
        trn.update();

        var ind = trn.angle/Math.PI*2*n_divisions;
				ind = (ind > n_divisions - 0.5)? 0: Math.round(ind);
        trn.angle_index = ind;


      }

    }
    
  }



}
