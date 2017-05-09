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
var animate,
	stopAnimation = false,
	ticker;
//Function attached to the stop/start button
d3.select("#stopstart").on("click", function() { 
	if(!stopAnimation) {
		ticker.cancel();
		stopAnimation = true;
		d3.select(this).text("restart the animation");
	} else {
		d3.select(this).text("stop the animation");
		stopAnimation = false;
		animate();
	}//else 
});

//Months during those weeks
var months = [
	"January", //1
	"January", //2
	"January", //3
	"January", //4
	"February", //5
	"February", //6
	"February", //7
	"February", //8
	"February & March", //9
	"March", //10
	"March", //11
	"March", //12
	"March & April", //13
	"April", //14
	"April", //15
	"April", //16
	"April & May", //17
	"May", //18
	"May", //19
	"May", //20
	"May", //21
	"May & June", //22
	"June", //23
	"June", //24
	"June", //25
	"June & July", //26
	"July", //27
	"July", //28
	"July", //29
	"July", //30
	"August", //31
	"August", //32
	"August", //33
	"August", //34
	"August & September", //35
	"September", //36
	"September", //37
	"September", //38
	"September & October", //39
	"October", //40
	"October", //41
	"October", //42
	"October", //43
	"October & November", //44
	"November", //45
	"November", //46
	"November", //47
	"November & December", //48
	"December", //49
	"December", //50
	"December", //51
	"December & January", //52
];

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
	.await(setUp);

function setUp(error, coordRaw) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Final data prep /////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	if (error) throw error;

	coordRaw.forEach(function(d) {
		d.x = +d.x;
		d.y = +d.y;
	});
	loc = coordRaw	

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw the other maps //////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	//Create a queue that loads in all the files first, before calling the draw function
	var q = d3.queue();

	for(var i = 0; i < nWeeks; i++) {
		//Add each predefined file to the queue
		q = q.defer(d3.csv, "../../../data/nadieh/VIIRS/mapData-week-" + (i+1) + ".csv");
	}//for i
	q.await(drawAllMaps);

}//function setUp

function drawAllMaps(error) {

	if (error) throw error;
	console.log("loaded all maps");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Map drawing settings //////////////////////////
	///////////////////////////////////////////////////////////////////////////

	function createMapMaker() {
		var drawMap = regl({

			vert: `
				precision highp float;

				//The progess along the transition
				uniform float progress;

				//Needed to calculate fopacity
				attribute float currOpacity;
				attribute float nextOpacity;
				//Needed to set gl_Pointsize
				attribute float currSize;
				attribute float nextSize;
				//Needed to set gl_Position
				attribute vec2 position;
				//Needed to set fcolor
				attribute vec3 currColor;
				attribute vec3 nextColor;

				//Will get values used in the fragment shader
				varying float fopacity;
				//varying float fsize;
				varying vec3 fcolor;

				void main () {

					fcolor = mix(currColor, nextColor, progress);
					fopacity = mix(currOpacity, nextOpacity, progress);
					//fsize = size/7.5;

					gl_PointSize = mix(currSize, nextSize, progress);
					gl_Position = vec4(position, 0, 1);
				}
			`,

			frag: `

				precision highp float;

				#ifdef GL_OES_standard_derivatives
					#extension GL_OES_standard_derivatives : enable
				#endif

				varying float fopacity;
				//varying float fsize;
				varying vec3 fcolor;

				void main (){

					//Creating a circle out of a square:

					//Determine normalized distance from center of point
					float point_dist = length(gl_PointCoord * 2. - 1.);

					//Based in part on: 
					//http://bl.ocks.org/monfera/85aa9627de1ae521d3ac5b26c9cd1c49
					//http://www.numb3r23.net/2015/08/17/using-fwidth-for-distance-based-anti-aliasing
					//https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl
					#ifdef GL_OES_standard_derivatives
						//Anti-aliasing-factor
						float aaf = fwidth(point_dist)/2.0;
						//if(point_dist + aaf > 1.0) discard; //strangley this doesn't work as inteded at all
						float alpha = fopacity * (1.0 - smoothstep(1.0 - aaf, 1.0 + aaf, point_dist));
					#else
						if(point_dist > 1.0) discard;
					#endif

					//From:https://gist.github.com/rflow/39692bd181fb1eb0b077a4caf886b077
					//But seems to discard too much for smaller circles
					//Calc scale at which to start fading out the circle
					//float min_dist = fsize * 0.7;
					//Calc scale at which we find the edge of the circle
					//float max_dist = fsize;
					//From https://thebookofshaders.com/glossary/?search=smoothstep
					//float alpha = fopacity * (1.0 - smoothstep(min_dist, max_dist, point_dist));

					//The most basic way to get a (pixelated) circle
					//if (point_dist > 1.0) discard;
					
					gl_FragColor = vec4(fcolor, alpha);

				}//void main
			`,

			depth: { enable: false },

			blend: {
				enable: true,
				func: { srcRGB: 'src alpha', dstRGB: 'one minus src alpha', srcAlpha: 1, dstAlpha: 'one minus src alpha' },
				equation: { rgb: 'add', alpha: 'add' },
			},

			attributes: {
				position: mapPoints,
				currColor: regl.prop('currColor'),
				nextColor: regl.prop('nextColor'),
				currOpacity: regl.prop('currOpacity'),
				nextOpacity: regl.prop('nextOpacity'),
				currSize: regl.prop('currSize'),
				nextSize: regl.prop('nextSize'),
			},

			uniforms: {
				progress: regl.prop('progress'),
			},//uniforms

			count: mapPoints.length,
			primitive: 'points',

		});//drawTriangle

		return drawMap;
	}//function createMapMaker

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Animate through the maps ////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Render loop
	const fps = 5;
	const tweenTime = 3;
	const tweenFrames = fps * tweenTime;

	//Keeps track of the week and progress within interpolation
	var counter = 0,
		frame,
		progress;

	var currMap,
		nextMap;

	animate = function() {

		//Sve in variable, so we can cancel and restart
		ticker = regl.frame(function({ tick }) {
			regl.clear({
				color: [0, 0, 0, 0],
				depth: 1
			})

			//Increment frame counter until we reach the desired loop point
			frame = tick % tweenFrames;
			//Increment state counter once we've looped back around
			if (frame === 0) {
				counter = ++counter % nWeeks;
				//Adjust the title
				d3.select("#week").text("Week " + (counter+1) + ", " + months[counter] + ", 2016");
			}//if
			//Track progress as proportion of frames completed
			progress = frame / tweenFrames;
			//console.log(counter, frame, progress);

			//Current and next map to interpolate to
			currMap = maps[counter];
			nextMap = maps[(counter+1) % nWeeks];

			//Draw the map
			drawMap({ 
				currColor: currMap.colors,
				nextColor: nextMap.colors,
				currOpacity: currMap.opacities,
				nextOpacity: nextMap.opacities,
				currSize: currMap.sizes,
				nextSize: nextMap.sizes,
				progress: progress 
			});
		});//frame

	}//function animate

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Final data preparation /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//The locations of every map are the same, so save the in a variable
	var mapPoints = loc.map(function(d) { return [xScale(d.x), yScale(d.y)]; });

	//Create the regl function
	const drawMap = createMapMaker();

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

		//Now create a new array that shuffles the data a bit
		var dataObject = {
			colors: data.map(function(d) { return d.color; }),
			opacities: data.map(function(d) { return d.opacity; }),
			sizes: data.map(function(d) { return 2*d.size; }),	
		};

		//And save in a new array
		maps[(i-1)] = dataObject;
	}//for i

	//Delete the arguments since we now have all the data in a new variable
	delete arguments;

	console.log("map data prepped");

	//Start the animation
	animate();

}//function drawAllMaps


