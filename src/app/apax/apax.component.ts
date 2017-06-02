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

	adjust(mp)
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

	toCenter(p)
	{
		return [p[0] - this.wo2, p[1] - this.ho2];
	}
	fromCenter(p)
	{
		return [p[0] + this.wo2, p[1] + this.ho2];
	}
}





class PRotate
{
	public n_sectors: number;
	public da: number;
	public ca: number;
	public sa: number;
	constructor(n_sectors)
	{
		this.n_sectors = n_sectors;
		this.da = 2*Math.PI/n_sectors;
		this.ca = Math.cos(this.da);
		this.sa = Math.sin(this.da);
	}

	rotate(p)
	{
		return [p[0]*this.ca - p[1]*this.sa,
				p[0]*this.sa + p[1]*this.ca];
	}

	towardZero(a)
	{
		return (a > 0.0)? Math.floor(a+0.5): Math.ceil(a-0.5);
	}
	plot(state, p)
	{
		var r = [];
		p = state.toCenter(p);
		for (var i=0; i<this.n_sectors; ++i)
		{
			var p2 = [this.towardZero(p[0]), this.towardZero(p[1])]; // floor toward the center
			p2 = state.fromCenter(p2);
			var pi = Math.floor(p2[0]);
			var pj = Math.floor(p2[1]);
			r.push([pi,pj]);
			p = this.rotate(p);
		}
		return r;


		/*p = state.toCenter(p);
		for (var i=0; i<this.n_sectors; ++i)
		{
			var p2 = [towardZero(p[0]), towardZero(p[1])]; // floor toward the center
			p2 = state.fromCenter(p2);
			var pi = Math.floor(p2[0]);
			var pj = Math.floor(p2[1]);
			if (pi > 0 && pi < state.width &&
				pj > 0 && pj < state.height)
			{
				state.data[pi][pj] = v;
			}
			p = this.rotate(p);
		}*/
	}
}

class PReflect
{
	public v;
	constructor(v)
	{
		this.v = v;
	}

	plot(state, p)
	{
		var ai = p[0], aj = p[1];
		var bi = state.width-ai-1, bj = state.height-aj-1;
		if (this.v == '|') 
		{
			return [[ai,aj],[bi,aj]];
		}
		else if (this.v == '-')
		{
			return [[ai,aj],[ai,bj]];
		}
		else if (this.v == '\\')
		{
			return [[ai,aj],[aj,ai]];
		}
		else if (this.v == '/')
		{
			return [[ai,aj],[bj,bi]];
		}
	}

}

class PTile
{
	public nx: number;
	public ny: number;
	constructor(nx, ny)
	{
		this.nx = nx;
		this.ny = ny;
	}
	plot(state, p)
	{
		var sx = Math.floor(state.width/this.nx);
		var sy = Math.floor(state.height/this.ny);
		var r = [];
		var ox = p[0]%sx;
		var oy = p[1]%sy;
		for (var i=0; i<this.nx; ++i)
		{
			for (var j=0; j<this.ny; ++j)
			{
				r.push([ox+i*sx,oy+j*sy]);
			}
		}
		return r;
	}
}


/*function PScale(s, n)
{
	this.s = s;
	this.n = n;
}
PScale.prototype.plot = function(state, p)
{
	p = state.toCenter(p);
	var r = [];
	for (var i=0; i<this.n; ++i)
	{
		var p2 = [towardZero(p[0]), towardZero(p[1])]; // floor toward the center
		p2 = state.fromCenter(p2);
		var pi = Math.floor(p2[0]);
		var pj = Math.floor(p2[1]);
		r.push([pi,pj]);
		p[0] *= this.s;
		p[1] *= this.s;
	}
	return r;
}*/







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
	private mp: any = 
	{
		palette: this.createGrayscalePalette(4),
		width: 64,
		height: 64,
		scale: 4,
		brush: 1,
		transparency: false,
		seed: 0 // new Date().getTime();
		
	}

	constructor() {}


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


	renderImage()
	{
		var ctx = this.canvas.getContext("2d");
		var img_data = ctx.createImageData(this.canvas.width, this.canvas.height);
		for (var i=0; i<this.state.width; ++i)
		{
			for (var j=0; j<this.state.height; ++j)
			{
				var v = this.state.data[i][j];
				var c = (v == -1)? [0,0,0,0]: this.mp.palette[v]; // may not be necessary, createImageData defaults to transparent black
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


	drawPixel(p, v)
	{
		var pts = [p];
		for (var i=0; i<this.transforms.length; ++i)
		{
			let pts2 = [];
			for (var j=0; j<pts.length; ++j)
			{
				pts2 = pts2.concat(this.transforms[i].plot(this.state, pts[j]));
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
			//state.data[p[0]][p[1]] = mp.brush;
			this.drawPixel(p, this.mp.brush);
			this.renderImage();
			this.mouse_down = true;
		}
	}

	mouseMove(e)
	{
		if (this.mouse_down)
		{
			var p = this.screenToImage(e);
			this.drawPixel(p, this.mp.brush);
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







	createGrayscalePalette(n_grey)
	{
		var r = [];
		var s = 255/(n_grey-1);
		for (var i=0; i<n_grey; ++i)
		{
			var c = i*s;
			r.push([c, c, c, 255]);
		}
		return r;
	}






	refreshCursor()
	{
		var c = (this.mp.brush == -1)? [0,0,0,255]: this.mp.palette[this.mp.brush];
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
		this.mp.brush = v;
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
			var color = this.mp.palette[brush];
			ctx.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]+")";
			ctx.fillRect(0, 0, w, h);
		}

		return canvas;
	}


	refreshPaletteDiv()
	{
		var palette_div = document.getElementById("palettediv");
		while (palette_div.firstChild) // clear all children
		{
			palette_div.removeChild(palette_div.firstChild);
		}

		if (this.mp.transparency)
		{
			var eraser = this.createBrushCanvas(-1);
			palette_div.appendChild(eraser);
		}

		for (var i=0; i<this.mp.palette.length; ++i)
		{
			var canvas = this.createBrushCanvas(i);
			palette_div.appendChild(canvas);
		}
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
		this.state.adjust(this.mp);
		this.canvas = <HTMLCanvasElement> document.getElementById('cmain');
		this.canvas.width = this.mp.width*this.mp.scale;
		this.canvas.height = this.mp.height*this.mp.scale;
		this.refreshCursor();
		this.renderImage();
	}


	ngOnInit()
	{
		this.refreshPaletteDiv();

		this.canvas = <HTMLCanvasElement> document.getElementById('cmain');
		this.canvas.width = this.mp.width*this.mp.scale;
		this.canvas.height = this.mp.height*this.mp.scale;
		var ctx = this.canvas.getContext("2d");

		this.state = new PState(this.mp);



		this.transforms = [new PReflect('-'),new PReflect('|'), new PTile(4,4)];
		//this.transforms = [new PRotate(2), new PReflect('|')];

		this.refreshCursor();

		

		//Math.seedrandom(this.mp.seed);





		//var transforms = [new PTile(8,8)];



		// have palette right next to canvas
		// eraser
		// store with -1 value - no value, no alpha (translate to 0,0,0,0)
		// presence and absence


		// var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		// var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	}

}


