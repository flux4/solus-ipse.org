import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // for query parameters
import { FadeAnimation } from '../fade.animation';

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
  styleUrls: ['./apax.component.css'],
  animations: [FadeAnimation],
  host: {
    '(document:click)': 'documentClick($event)',
    '[@routerTransition]': 'true'
  }
})

export class ApaxComponent implements OnInit
{

  private state: PState;
  private canvas: HTMLCanvasElement;
  public transforms: any;
  private mouse_down: boolean = false;
  public mp: any = {
    width: 64,
    height: 64,
    scale: 6,
    transparency: false
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
  public brush: number = 3;

  private router: Router;


  constructor(router: Router) {
    this.router = router;
  }

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


  private color_picker_first_open = false;

  documentClick(evt) {
    if (this.color_picker_first_open) {
      this.color_picker_first_open = false;
      return;
    }
    if (!this.color_picker_hidden && !(document.getElementById('color_picker').contains(evt.target))) {
      this.colorPickerCancel();
    }
  }

  openColorPicker(evt, id) {
    this.brush = id;
    this.color_picker_mode = 'rgb';
    this.color_picker_selected_palette = id;
    var c = this.palette[id];
    for (var i=0; i<this.slider_values.length; ++i) {
      this.slider_values[i] = this.palette[id][i]/255;
    }
    this.updateColorPicker(null, -1);
    this.color_picker_x = evt.clientX-255;
    this.color_picker_y = evt.clientY;
    this.color_picker_hidden = false;
    this.color_picker_first_open = true;
    return false;
  }

  addColorToPalette() {
    this.palette.push([0,0,0,255]);
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
    if (this.palette.length > 1) {
      this.palette.splice(i,1);
      var v = (this.mp.transparency)? -1: 0;
      this.state.replaceColor(i,v);
      if (this.brush == i) {
        this.brush = 0;
        this.refreshCursor();
      }
      this.renderImage();
    }
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
      this.slider_values[3] = 1.0;
      for (var i=0; i<this.palette.length; ++i) {
        if (this.palette[i][3] < 255) {
          this.palette[i][3] = 255;
        }
      }
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


  
  /*saveToUrl() {
    var obj = {
      width: this.mp.width,
      height: this.mp.height,
      scale: this.mp.scale,
      transparency: this.mp.transparency,
      transforms: this.transforms,
      palette: this.palette,
      image: this.encodeImage()
    }
    this.router.navigate([], { queryParams: obj });
    // { skipLocationChange: true }
  }

  // https://stackoverflow.com/questions/35688084/how-get-query-params-from-url-in-angular2
  loadFromUrl() {

  }

  // https://softwareengineering.stackexchange.com/questions/261184/how-would-you-go-about-compressing-a-list-of-integers-that-are-non-unique-and-re
  encodeImage(): string {
    let char_set = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let r: string = "";
    for (var i=0; i<this.state.width; ++i) {
      for (var j=0; j<this.state.height; ++j) {
        r += char_set.charAt(this.state.data[i][j]);
      }
    }
    return r;
  }*/

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

  transform(sym: any, p: number[]) {
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
    return [p];
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








  public sliders;
  public slider_values;
  public color_picker_mode = 'rgb';
  public line_height = 8;
  public color_picker_border = '';
  public color_picker_hidden = true;
  public color_picker_x;
  public color_picker_y;
  public color_picker_selected_palette;

  HSVtoRGB(c) {

    var h = c[0];
    var s = c[1];
    var v = c[2];
    var a = c[3];

    var i = Math.floor(h*6);
    var f = h*6-i;
    var p = v*(1-s);
    var q = v*(1-f*s);
    var t = v*(1-(1-f)*s);
    var r, g, b;

    switch (i%6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return [
      Math.floor(r*255),
      Math.floor(g*255),
      Math.floor(b*255),
      Math.floor(a*255)
    ];
  }

  RGBtoHSV(c) {

    var r = c[0];
    var g = c[1];
    var b = c[2];
    var a = c[3];

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var d = max - min;
    var h;
    var s = (max === 0? 0: d / max);
    var v = max / 255;

    switch (max) {
      case min: h = 0; break;
      case r: h = (g-b)+d * (g < b? 6: 0); h/=6*d; break;
      case g: h = (b-r)+d * 2; h /= 6 * d; break;
      case b: h = (r-g)+d * 4; h /= 6 * d; break;
    }

    return [h,s,v,a];
  }

  toRGB(v) {
    if (this.color_picker_mode == 'rgb') {
      return [
        Math.floor(v[0]*255),
        Math.floor(v[1]*255),
        Math.floor(v[2]*255),
        Math.floor(v[3]*255)
      ];
    } else {
      return this.HSVtoRGB(v);
    }
  }


  colorPickerSwitchToRGB() {
    if (this.color_picker_mode != 'rgb') {
      this.color_picker_mode = 'rgb';
      this.slider_values = this.HSVtoRGB(this.slider_values);
      this.slider_values[0] /= 255;
      this.slider_values[1] /= 255;
      this.slider_values[2] /= 255;
      this.slider_values[3] /= 255;
      this.updateColorPicker(null, -1);
    }
  }
  colorPickerSwitchToHSV() {
    if (this.color_picker_mode != 'hsv') {
      this.color_picker_mode = 'hsv';
      this.slider_values = this.RGBtoHSV([this.slider_values[0]*255,
                                this.slider_values[1]*255,
                                this.slider_values[2]*255,
                                this.slider_values[3]*255]);
      this.updateColorPicker(null, -1);
    }
  }
  colorSliderMouseDown(evt, id) {
    this.updateColorPicker(evt, id);
    return false;
  }
  colorSliderMouseMove(evt, id) {
    if (evt.which === 1) {
      this.updateColorPicker(evt, id);
    }
    return false;
  }
  colorPickerOk() {
    this.palette[this.color_picker_selected_palette] = this.toRGB(this.slider_values);
    this.color_picker_selected_palette = -1;
    this.color_picker_hidden = true;
    this.refreshCursor();
    this.renderImage();
  }
  colorPickerCancel() {
    this.color_picker_hidden = true;
  }
  updateColorPicker(evt, id) {
    if (evt != null) this.updateSliderValue(evt, id);
    for (var i=0; i<this.sliders.length; ++i) {
      this.drawColorSlider(i);
    }
    var rgb = this.toRGB(this.slider_values);
    var rgb_txt = this.toRGBText(rgb);
    this.color_picker_border = rgb_txt;
  }

  updateSliderValue(evt, id) {
    let cnv = this.sliders[id];
    let rect = cnv.getBoundingClientRect();
    var v = (evt.clientX - rect.left + 1)/(cnv.width);
    if (v < 0) v = 0;
    if (v > 1) v = 1;
    this.slider_values[id] = v;
  }
  drawColorSlider(id) {
    var v = this.slider_values.slice();
    var cnv = this.sliders[id];
    var ctx = cnv.getContext('2d');
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.lineWidth = 1;
    var rgb = this.toRGB(v);
    var pv = Math.floor(this.slider_values[id]*cnv.width)+0.5;
    ctx.strokeStyle = this.toRGBText(rgb);
    ctx.beginPath();
    ctx.moveTo(pv, 0);
    ctx.lineTo(pv, cnv.height);
    ctx.stroke();

    ctx.lineWidth = 2;  
    for (var i=0; i<cnv.width; ++i) {
      var t = i/cnv.width;
      v[id] = t;
      rgb = this.toRGB(v);
      
      var offset = (cnv.height - this.line_height)/2;
      ctx.strokeStyle = this.toRGBText(rgb);
      ctx.beginPath();
      ctx.moveTo(i, offset);
      ctx.lineTo(i, offset+this.line_height);
      ctx.stroke();
    }
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
    this.sliders = [document.getElementById('slider0'),
                    document.getElementById('slider1'),
                    document.getElementById('slider2'),
                    document.getElementById('slider3')];
    for (var i=0; i<this.sliders.length; ++i) {
      this.sliders[i].width = 255;
      this.sliders[i].height = 20;
    }
    this.slider_values = [0,0,0,1];
    this.updateColorPicker(null, -1);
  }

}
