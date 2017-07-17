import { Component, OnInit, NgZone } from '@angular/core';


class Hypercube {
  public points: number[][];
  public edges: number[][];
  constructor(n_dimensions: number) {
    var n_pts = 1 << n_dimensions;
    this.points = [];
    for (var i=0; i<n_pts; ++i) {
      var t = i;
      var p = [];
      for (var j=0; j<n_pts; ++j) {
        var v = (t%2 == 0)? -1: 1;
        p.push(v);
        t = Math.floor(t/2);
      }
      this.points.push(p);
    }

    // creat edges between vertices that only differ in a single dimension
    this.edges = []; // n*(n-1)/2
    for (var i=0; i<n_pts; ++i) {
      for (var j=i+1; j<n_pts; ++j) {
        var n_different = 0;
        for (var k=0; k<n_dimensions; ++k) {
          if (this.points[i][k] != this.points[j][k]) {
            n_different++;
            if (n_different >= 2) {
              break;
            }
          }
        }
        if (n_different === 1) {
          this.edges.push([i, j]);
        }
      }
    }

  }
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
    this.goal_angle = -1;
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

  public mp = {
    n_dimensions: 4,
    n_divisions: 8,
    speed: 10,
    accentuation: 95,
    line_width: 1
  };

  public transforms: Transform[];
  public hypercube: Hypercube;
  public any_animated: boolean;

  public cnv: HTMLCanvasElement;

  private ngzone: NgZone; // for refreshing canvas dimensions
  constructor(ngzone: NgZone) {
    this.ngzone = ngzone;
    this.cnv = <HTMLCanvasElement>document.getElementById('cmain');
  }

  refreshCanvasDimensions() {
    this.cnv = <HTMLCanvasElement>document.getElementById('cmain');
    this.cnv.width  = this.cnv.clientWidth;
    this.cnv.height = this.cnv.clientHeight;
  }

  ngOnInit() {
    this.refreshCanvasDimensions();
    this.createHypercube();
    window.onresize = (e) => {
        this.ngzone.run(() => {
          this.refreshCanvasDimensions();
        });
    };
    this.animate(this);
  }

  setDimensions(n) {
    this.mp.n_dimensions = n;
    this.createHypercube();
  }
  setDivisions(n_divisions) {
    this.mp.n_divisions = Math.pow(2,n_divisions);
    this.setAllAnglesToIndex();
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

  angleToIndex(angle: number) {
    var n_divisions = this.mp.n_divisions;
    var ind = angle/(Math.PI*2)*n_divisions;
		ind = (ind > n_divisions - 0.5)? 0: Math.round(ind);
    return ind;
  }
  indexToAngle(angle_index: number) {
    return Math.PI*2*angle_index/this.mp.n_divisions;
  }

  randomizeAngles() {
    var n_divisions = this.mp.n_divisions;
    for (var i=0; i<this.transforms.length; ++i) {
      var v = Math.random();
      var ind = Math.floor(v*n_divisions);
      this.transforms[i].angle_index = ind;
      this.transforms[i].goal_angle = (ind/n_divisions)*Math.PI*2;
    }
  }

  resetAngles() {
    for (var i=0; i<this.transforms.length; ++i) {
      this.transforms[i].goal_angle = 0;
      this.transforms[i].angle_index = 0;
    }
  }

  setAllAnglesToIndex() {
    for (var i=0; i<this.transforms.length; ++i) {
      this.transforms[i].angle = this.indexToAngle(this.transforms[i].angle_index);
    }
  }

  leftAnimationArrowClicked(i) {
    this.transforms[i].animate = -1;
    this.setAllAnglesToIndex();
    this.any_animated = true;
  }
  rightAnimationArrowClicked(i) {
    this.transforms[i].animate = 1;
    this.setAllAnglesToIndex();
    this.any_animated = true;
  }
  leftAnimateAll() {
    for (var i=0; i<this.transforms.length; ++i) {
      this.transforms[i].animate = -1;
    }
    this.setAllAnglesToIndex();
    this.any_animated = true;
  }
  rightAnimateAll() {
    for (var i=0; i<this.transforms.length; ++i) {
      this.transforms[i].animate = 1;
    }
    this.setAllAnglesToIndex();
    this.any_animated = true;

  }
  checkAnyAnimated() {
    var any_animated = false;
    for (var i=0; i<this.transforms.length; ++i) {
      if (this.transforms[i].animate != 0) {
        any_animated = true;
      }
    }
    this.any_animated = any_animated;
  }
  stopAnimation(i) {
    var trn = this.transforms[i];
    trn.animate = 0;
    trn.angle = this.indexToAngle(trn.angle_index);
    trn.update();
    this.checkAnyAnimated();
  }
  stopAllAnimation() {
    for (var i=0; i<this.transforms.length; ++i) {
      this.transforms[i].animate = 0;
    }
    this.any_animated = false;
  }
  angleChanged(i, v) {
    this.transforms[i].angle_index = v;
    this.transforms[i].goal_angle = this.indexToAngle(v);
  }


  createHypercube() {
    var n_dimensions = this.mp.n_dimensions;
    var hc = new Hypercube(n_dimensions);
    var trn = [];
    for (var i=0, k=0; i<n_dimensions; ++i) {
      for (var j=i+1; j<n_dimensions; ++j, ++k) {
        trn.push(new Transform(0.0, i, j));
      }
    }
    this.hypercube = hc;
    this.transforms = trn;
    this.any_animated = false;
  }

  animate(kbc: KybosComponent) {
    kbc.draw();
    window.requestAnimationFrame(function() {
      kbc.animate(kbc);
    });
  }

  draw() {

    let speed:number = this.mp.speed/100;
    let n_divisions:number = this.mp.n_divisions;
    let accentuation:number = this.mp.accentuation/100;

    for (var i=0; i<this.transforms.length; ++i) {
      let trn: Transform = this.transforms[i];

      // update movement toward goal angle
      if (trn.goal_angle != -1) {
        trn.angle += (trn.goal_angle - trn.angle)*speed*2;
        trn.angle = this.wrapAngle(trn.angle);
        if (Math.abs(trn.angle-trn.goal_angle) < 0.001) {
          trn.angle = trn.goal_angle;
          trn.goal_angle = -1;
        }
        trn.update();
      }

      // animate movement
      if (trn.animate != 0) {
        var ps = speed + speed*Math.sin(trn.angle*n_divisions-Math.PI/2)*accentuation;
        trn.angle += (trn.animate == -1)? -ps: ps;
        trn.angle = this.wrapAngle(trn.angle);
        trn.angle_index = this.angleToIndex(trn.angle);
        trn.update();
      }
    }

    
    let ctx = this.cnv.getContext('2d');
    ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

    var w = this.cnv.width;
    var h = this.cnv.height;
    var s = Math.min(w, h)*0.19;
    var hc = this.hypercube;
    var trn = this.transforms;
    var p2d = [];
    for (var i=0; i<hc.points.length; ++i) {
      var p = hc.points[i].slice(0);
      for (var j=0; j<trn.length; ++j) {
        trn[j].transform(p);
      }
      p[0] *= s;
      p[1] *= s;
      p[0] += w/2;
      p[1] = h/2 - p[1];
      p2d.push(p);
    }

    ctx.lineWidth = this.mp.line_width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    for (var i=0; i<hc.edges.length; ++i) {
		  ctx.moveTo(p2d[hc.edges[i][0]][0], p2d[hc.edges[i][0]][1]);
			ctx.lineTo(p2d[hc.edges[i][1]][0], p2d[hc.edges[i][1]][1]);
		}
		ctx.stroke();
  }

}
