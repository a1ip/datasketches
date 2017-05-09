var width = 2000; //document.body.clientWidth; 
//Mercator map ratio
var mapRatio = 0.5078871;
var height = Math.round(mapRatio * width);

var canvas = document.getElementById("canvas");
canvas.width = width;
canvas.height = height;
//Get the visible size back to 1000 px
canvas.style.width = (width*0.5) + 'px';
canvas.style.height = (height*0.5) + 'px';
//canvas.getContext("2d").scale(0.5, 0.5);

var regl = createREGL({
	extensions: ['OES_standard_derivatives'],
	canvas: canvas,
	alpha: true,
	antialias: true
});

const pointWidth = 3;

///////////////////////////////////////////////////////////////////////////
///////////////////////// Create global variables /////////////////////////
///////////////////////////////////////////////////////////////////////////

//Number of weeks in the year :)
const nWeeks = 52;

//Will save the x-coordinate mapping
var loc;

//The minimum and maximum values of the layer variable
const maxL = 0.8,
	  minL = 0; //-0.06;

//Timer variables
var timer,
	stopAnimation = false;

///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Create scales /////////////////////////////
///////////////////////////////////////////////////////////////////////////

var xScale = d3.scaleLinear()
	.domain([1, 500])
	.range([-1, 1]);

var yScale = d3.scaleLinear()
	.domain([1, 250])
	.range([-1,1]);

var radiusScale = d3.scaleSqrt()
	.domain([minL, maxL])
	.range([0, 5])
	.clamp(true);

var opacityScale = d3.scaleLinear()
	.domain([minL, maxL])
	.range([1, 0.5]);

var greenColor = d3.scaleLinear()
	.domain([minL, maxL])
	.range(["#d9e537", "#008800"]);

//Wrap d3 color scales so they produce vec3s with values 0-1
//Also limit the t value to remove darkest color
function wrapColorScale(scale) {
	return function(t) {
		const rgb = d3.rgb(scale(t));
		return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
	};
}//wrapColorScale
var greenColorRGB = wrapColorScale(greenColor);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Read in the data /////////////////////////////
///////////////////////////////////////////////////////////////////////////

d3.queue() 
	.defer(d3.csv, "../../../data/nadieh/worldMap_coordinates.csv")
	.defer(d3.csv, "../../../data/nadieh/VIIRS/mapData-week-22.csv")
	.await(drawFirstMap);

function drawFirstMap(error, coordRaw, data) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Final data prep /////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	if (error) throw error;

	coordRaw.forEach(function(d) {
		d.x = +d.x;
		d.y = +d.y;
	});
	loc = coordRaw	

	data.forEach(function(d) {
		d.layer = +d.layer;
		d.color = greenColorRGB(d.layer);
		d.opacity = opacityScale(d.layer);
		d.size = radiusScale(d.layer); 
	});

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create first map ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	console.log("drawing circles");

	var drawTriangle = regl({

		vert: `
			attribute float opacity;
			attribute float size;
			attribute vec2 position;
			attribute vec3 color;

			varying float fopacity;
			varying vec3 fcolor;

			//uniform float pointWidth;

			void main () {

				//fcolor = abs(vec3(position.x, 0, position.y));
				fcolor = color;
				fopacity = opacity;

				gl_PointSize = size;
				gl_Position = vec4(position, 0, 1);
			}
		`,

		frag: `

			#ifdef GL_OES_standard_derivatives
				#extension GL_OES_standard_derivatives : enable
			#endif

			precision highp float;

			varying float fopacity;
			varying vec3 fcolor;

			void main (){
				//Creating a circle out of a square:
				//Based on https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
				//and https://github.com/regl-project/regl/blob/gh-pages/example/particles.js
				//if (length(gl_PointCoord.xy - 0.5) > 0.5) discard;
				vec2 cxy = 2.0 * gl_PointCoord - 1.0;
				float r2 = dot(cxy, cxy);
				if (r2 > 1.0) discard;
				gl_FragColor = vec4(fcolor, fopacity);

				// float r = 0.0, alpha = 1.0, delta = 0.0;
				// vec2 cxy = 2.0 * gl_PointCoord - 1.0;
				// r = dot(cxy, cxy);
				// #ifdef GL_OES_standard_derivatives
				// 	delta = fwidth(r);
				// 	alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
				// #endif
				// gl_FragColor = vec4(fcolor, 1) * alpha;
			}//void main
		`,

		depth: { enable: false },

		blend: {
			enable: true,
			func: { srcRGB: 'src alpha', dstRGB: 'one minus src alpha', srcAlpha: 1, dstAlpha: 'one minus src alpha' },
			equation: { rgb: 'add', alpha: 'add' },
		},

		attributes: {
			position: data.map(function(d,i) { return [xScale(loc[i].x), yScale(loc[i].y)]; }),
			color: data.map(function(d) { return d.color; }),
			opacity: data.map(function(d) { return d.opacity; }),
			size: data.map(function(d) { return 2*d.size; }), 
		},

		uniforms: {
			pointWidth: regl.prop('pointWidth'),
		},//uniforms

		count: data.length,
		primitive: 'points',

	});//drawTriangle

	drawTriangle({pointWidth});

	return; 

	regl.frame(function () {
		regl.clear({
			color: [0, .5*(1 + Math.cos(Date.now()/2000)), 1, 1],
			depth: 1
		})

		drawTriangle({pointWidth});
	});//frame

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw the other maps //////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	// //Create a queue that loads in all the files first, before calling the draw function
	// var q = d3.queue();

	// for(var i = 3; i < nWeeks; i++) {
	// 	//Add each predefined file to the queue
	// 	q = q.defer(d3.csv, "../../../data/nadieh/VIIRS/mapData-week-" + (i+1) + ".csv");
	// }//for i
	// q.await(drawAllMaps);

}//function drawFirstMap

function drawAllMaps(error) {

	if (error) throw error;

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Final data preparation /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	console.log("loaded all maps");

	//Create array that will hold all data
	maps = new Array(nWeeks);
	//Save each map in a variable, loop over it to make all variables numeric
	for (var i = 1; i < arguments.length; i++) {
		var data = arguments[i];
		data.forEach(function(d) {
			d.layer = +d.layer;
			d.color = greenColorRGB(d.layer);
			d.opacity = opacityScale(d.layer);
			d.size = radiusScale(d.layer); 
		});
		//And save in a new array
		maps[(i-1)] = data;
	}//for i
	//Delete the arguments since we now have all the data in a new variable
	delete arguments;

	console.log("map data prepped");

}//function drawAllMaps


