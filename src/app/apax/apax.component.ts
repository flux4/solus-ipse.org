import { Component, OnInit } from '@angular/core';

class PState
{
  public width: number;
  public height: number;
  public wo2: number;
  public ho2: number;
  public data;
  constructor(mp) {
    this.width = mp.width;
    this.height = mp.height;
    this.wo2 = mp.width/2;
    this.ho2 = mp.height/2;
    this.data = [];
    for (var i=0; i<mp.width; ++i)
    {
      var t = [];
      for (var j=0; j<mp.height; ++j)
      {
        t.push((mp.transparency)? -1: 0);
      }
      this.data.push(t);
    }
  }


  replaceColor(v1, v2) {
    for (var i=0; i<this.width; ++i) {
      for (var j=0; j<this.height; ++j) {
        if (this.data[i][j] == v1) {
          this.data[i][j] = v2;
        }
      }
    }
  }

  swapColors(v1, v2) {
    for (var i=0; i<this.width; ++i) {
      for (var j=0; j<this.height; ++j ) {
        if (this.data[i][j] == v1) {
          this.data[i][j] = v2;
        } else if (this.data[i][j] == v2) {
          this.data[i][j] = v1;
        }
      }
    }
  }

  adjustSize(mp)
  {
    var nd = [];
    for (var i=0; i<mp.width; ++i)
    {
      var t = [];
      for (var j=0; j<mp.height; ++j)
      {
        if (i < this.width && j < this.height)
        {
          t.push(this.data[i][j]);
        }
        else
        {
          t.push((mp.transparency)? -1: 0);
        }
      }
      nd.push(t);
    }
    this.width = mp.width;
    this.height = mp.height;
    this.wo2 = mp.width/2;
    this.ho2 = mp.height/2;
    this.data = nd;
  }

  clone(mp)
  {
    var r = new PState(mp);
    for (var i=0; i<this.width; ++i)
    {
      for (var j=0; j<this.height; ++j)
      {
        r.data[i][j] = this.data[i][j];
      }
    }
    return r;
  }

  // these enable rotations
  toCenter(p)
  {
    return [p[0] - this.wo2, p[1] - this.ho2];
  }
  fromCenter(p)
  {
    return [p[0] + this.wo2, p[1] + this.ho2];
  }
}



@Component({
  selector: 'app-apax',
  templateUrl: './apax.component.html',
  styleUrls: ['./apax.component.css']
})

export class ApaxComponent implements OnInit
{

  private state: PState;
  private canvas: HTMLCanvasElement;
  private transforms: any;
  private mouse_down: boolean = false;
  private mp: any = {
    width: 64,
    height: 64,
    scale: 6,
    transparency: false,
    seed: 0 // new Date().getTime();
  }

  public symmetries: any[] = [
    {
      type:'reflect',
      value:'|'
    },{
      type:'tile',
      nx:"4",
      ny:"4"
    }
  ];

  public palette = this.createGrayscalePalette(4);

  public brush: number = 0;



  public toRGBText(c): string {
    if (this.mp.transparency) {
      return 'rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]+')';
    }
    return 'rgb('+c[0]+','+c[1]+','+c[2]+')';
    
  }
  public toHex(v) {
    var r = v.toString(16).toUpperCase();
    return (r.length == 1)? '0'+r: r;
  }
  public toHexText(c): string {
    if (this.mp.transparency) {
      return '#'+this.toHex(c[0])+this.toHex(c[1])+this.toHex(c[2])+this.toHex(c[3]);
    }
    return '#'+this.toHex(c[0])+this.toHex(c[1])+this.toHex(c[2]);
  }

  createGrayscalePalette(n_grey) {
    var r = [];
    var s = 255/(n_grey-1);
    for (var i=0; i<n_grey; ++i)
    {
      var c = i*s;
      r.push([c,c,c,255]);
    }
    return r;
  }


  openColorPalette() {

  }



  addSymmetry() {
    this.symmetries.push({
      type:'none',
      value:0
    });
  }

  removeSymmetry(i) {
    this.symmetries.splice(i,1);
  }

  setSymmetryType(i,type) {
    let sym: any = this.symmetries[i];
    if (sym.type == type) return;
    sym.type = type;
    if (type == 'rotate') {
      sym.n_sectors = 2;
    } else if (type == 'reflect') {
      sym.value = '|';
    } else if (type == 'tile') {
      sym.nx = 2;
      sym.ny = 2;
    }
  }

  moveSymmetryUp(i) {
    if (i > 0) {
      var t = this.symmetries[i];
      this.symmetries[i] = this.symmetries[i-1];
      this.symmetries[i-1] = t;
    }
  }

  moveSymmetryDown(i) {
    if (i < this.symmetries.length-1) {
      var t = this.symmetries[i];
      this.symmetries[i] = this.symmetries[i+1];
      this.symmetries[i+1] = t;
    }
  }

  removeColor(i) {
    this.palette.splice(i,1);
    var v = (this.mp.transparency)? -1: 0;
    this.state.replaceColor(i,v);
    if (this.brush == i) {
      this.brush = 0;
      this.refreshCursor();
    }
    this.renderImage();
  }

  moveColorUp(i) {
    if (i > 0) {
      var t = this.palette[i];
      this.palette[i] = this.palette[i-1];
      this.palette[i-1] = t;
      this.state.swapColors(i, i-1);
      if (this.brush == i) {
        this.brush = i-1;
      } else if (this.brush == i-1) {
        this.brush = i;
      }
    }
  }

  moveColorDown(i) {
    if (i < this.palette.length-1) {
      var t = this.palette[i];
      this.palette[i] = this.palette[i+1];
      this.palette[i+1] = t;
      this.state.swapColors(i,i+1);
      if (this.brush == i) {
        this.brush = i+1;
      } else if (this.brush == i+1) {
        this.brush = i;
      }
    }
  }


  setRotator(i, n_sectors) {
    var sym = this.symmetries[i];
    sym.n_sectors = n_sectors;
    let a: number = 2*Math.PI/n_sectors;
    this.symmetries[i].ca = Math.cos(a);
    this.symmetries[i].sa = Math.sin(a);
  }




  clearImage() {
    for (var i=0; i<this.state.width; ++i) {
      for (var j=0; j<this.state.height; ++j) {
        this.state.data[i][j] = (this.mp.transparency)? -1: 0;
      }
    }
    this.renderImage();
  }

  saveImage() {
    window.open(this.canvas.toDataURL("image/png"));
  }

  toggleTransparency() {
    this.mp.transparency = !this.mp.transparency;
    if (!this.mp.transparency) {
      for (var i=0; i<this.state.width; ++i) {
        for (var j=0; j<this.state.height; ++j) {
          if (this.state.data[i][j] == -1) {
            this.state.data[i][j] = 0;
          }
        }
      }
      this.renderImage();
    }
  }



  constructor() {}

  renderImage()
  {
    var ctx = this.canvas.getContext("2d");
    var img_data = ctx.createImageData(this.canvas.width, this.canvas.height);
    for (var i=0; i<this.state.width; ++i)
    {
      for (var j=0; j<this.state.height; ++j)
      {
        let v: number = this.state.data[i][j];
        let c: number[] = (v == -1)? [0,0,0,0]: this.palette[v];
        for (var m=0; m<this.mp.scale; ++m)
        {
          var ni = i*this.mp.scale+m;
          for (var n=0; n<this.mp.scale; ++n)
          {
            var nj = j*this.mp.scale+n;
            var index = (ni + nj*this.canvas.width)*4;
            img_data.data[index+0] = c[0];
            img_data.data[index+1] = c[1];
            img_data.data[index+2] = c[2];
            img_data.data[index+3] = c[3];
          }
        }
      }
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // may not be necessary, putimagedata erases anything already there
    ctx.putImageData(img_data, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
  }




  screenToImage(e)
  {
    var rect = this.canvas.getBoundingClientRect();
    var p = [e.clientX - rect.left, e.clientY - rect.top];
    p[0] = Math.floor((p[0]/this.canvas.width)*this.state.width);
    p[1] = Math.floor((p[1]/this.canvas.height)*this.state.height);
    return p;
  }

  polarToRectangular(r, t)
  {
    var x = r*Math.cos(t);
    var y = r*Math.sin(t);
    return [x, y];
  }
  rectangularToPolar(x, y)
  {
    var r = Math.sqrt(x*x+y*y);
    var t = Math.atan2(y, x);
    return [r, t];
  }
  towardZero(a)
  {
    return (a > 0.0)? Math.floor(a+0.5): Math.ceil(a-0.5);
  }

  rotate(sym, p)
  {
    return [p[0]*sym.ca - p[1]*sym.sa,
        p[0]*sym.sa + p[1]*sym.ca];
  }

  transform(sym: any, p) {
    if (sym.type == 'rotate') {
      var r = [];
      p = this.state.toCenter(p);
      for (var i=0; i<sym.n_sectors; ++i)
      {
        var p2 = this.state.fromCenter(p);
        var pi = this.towardZero(p2[0]);
        var pj = this.towardZero(p2[1]);
        r.push([pi,pj]);
        p = this.rotate(sym, p);
      }
      return r;
    } else if (sym.type == 'reflect') {
      var ai = p[0], aj = p[1];
      var bi = this.state.width-ai-1, bj = this.state.height-aj-1;
      if (sym.value == '|') 
      {
        return [[ai,aj],[bi,aj]];
      }
      else if (sym.value == '-')
      {
        return [[ai,aj],[ai,bj]];
      }
      else if (sym.value == '\\')
      {
        return [[ai,aj],[aj,ai]];
      }
      else if (sym.value == '/')
      {
        return [[ai,aj],[bj,bi]];
      }
    } else if (sym.type == 'tile') {
      var sx = Math.floor(this.state.width/sym.nx);
      var sy = Math.floor(this.state.height/sym.ny);
      var r = [];
      var ox = p[0]%sx;
      var oy = p[1]%sy;
      for (var i=0; i<sym.nx; ++i)
      {
        for (var j=0; j<sym.ny; ++j)
        {
          r.push([ox+i*sx,oy+j*sy]);
        }
      }
      return r;
    }
  }
  drawPixel(p, v)
  {
    var pts = [p];
    for (var i=0; i<this.symmetries.length; ++i)
    {
      let pts2 = [];
      for (var j=0; j<pts.length; ++j)
      {
        pts2 = pts2.concat(this.transform(this.symmetries[i], pts[j]));
      }
      pts = pts2;
    }
    for (var i=0; i<pts.length; ++i)
    {
      if (pts[i][0] >= 0 && pts[i][0] < this.state.width &&
        pts[i][1] >= 0 && pts[i][1] < this.state.height)
      {
        this.state.data[pts[i][0]][pts[i][1]] = v;
      }
    }
  }

  mouseDown(e)
  {
    if (e.button == 0)
    {
      var p = this.screenToImage(e);
      this.drawPixel(p, this.brush);
      this.renderImage();
      this.mouse_down = true;
    }
  }
  mouseMove(e)
  {
    if (this.mouse_down)
    {
      var p = this.screenToImage(e);
      this.drawPixel(p, this.brush);
      this.renderImage();
    }
  }
  mouseUp(e)
  {
    this.mouse_down = false;
  }
  mouseLeave(e)
  {
    this.mouse_down = false;
  }














  refreshCursor()
  {
    let c: number[] = (this.brush == -1)? [0,0,0,255]: this.palette[this.brush];
    var cnv = document.createElement('canvas');
    cnv.width = this.mp.scale;
    cnv.height = this.mp.scale;

    var ctx = cnv.getContext("2d");
    ctx.fillStyle = "rgba("+c[0]+","+c[1]+","+c[2]+","+c[3]+")";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    var img_url = 'url('+cnv.toDataURL()+')';
    var cmain = document.getElementById("cmain");
    cmain.style.cursor = img_url+" "+(this.mp.scale/2)+" "+(this.mp.scale/2)+", auto";
  }

  setBrush(v)
  {
    this.brush = v;
    this.refreshCursor();
  }

  createBrushCanvas(brush)
  {
    var w = 20, h = 20;
    var xb = 2;
    var canvas:any = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.style.margin = "4px";
    canvas.style.border = "0.5px solid gray";

    canvas.brush = brush;
    var t = this;
    canvas.onclick = function()
    {
      t.setBrush(this.brush);
    };

    var ctx = canvas.getContext("2d");

    if (brush == -1)
    {

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "white";

      ctx.beginPath();
      ctx.moveTo(xb, xb);
      ctx.lineTo(w-xb, h-xb);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w-xb, xb);
      ctx.lineTo(xb, h-xb);
      ctx.stroke();
    }
    else
    {
      var color = this.palette[brush];
      ctx.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]+")";
      ctx.fillRect(0, 0, w, h);
    }

    return canvas;
  }


  private isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
  setWidth(v) {
    if (this.isNumeric(v)) {
      this.mp.width = v;
      this.refreshState();
    }
  }

  setHeight(v) {
    if (this.isNumeric(v)) {
      this.mp.height = v;
      this.refreshState();
    }
  }

  setScale(v) {
    if (this.isNumeric(v)) {
      this.mp.scale = v;
      this.refreshState();
    }
  }

  refreshState() {
    this.state.adjustSize(this.mp);
    this.canvas = <HTMLCanvasElement> document.getElementById('cmain');
    this.canvas.width = this.mp.width*this.mp.scale;
    this.canvas.height = this.mp.height*this.mp.scale;
    this.refreshCursor();
    this.renderImage();
  }


  ngOnInit()
  {
    this.canvas = <HTMLCanvasElement> document.getElementById('cmain');
    this.canvas.width = this.mp.width*this.mp.scale;
    this.canvas.height = this.mp.height*this.mp.scale;
    var ctx = this.canvas.getContext("2d");

    this.state = new PState(this.mp);

    this.renderImage();

    this.refreshCursor();

    //Math.seedrandom(this.mp.seed);

  }

}
