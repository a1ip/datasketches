var width = 1000; //document.body.clientWidth; 
//Mercator map ratio
var mapRatio = 0.5078871;
var height = Math.round(mapRatio * width);

//Create the canvas
var canvas = document.getElementById("canvas");
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

//From https://www.html5rocks.com/en/tutorials/canvas/hidpi/#toc-1
var devicePixelRatio = window.devicePixelRatio || 1;
var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
						ctx.mozBackingStorePixelRatio ||
						ctx.msBackingStorePixelRatio ||
						ctx.oBackingStorePixelRatio ||
						ctx.backingStorePixelRatio || 1;
var ratio = devicePixelRatio / backingStoreRatio;

//Upscale the canvas if the two ratios don't match
if (devicePixelRatio !== backingStoreRatio) {
	canvas.width = width * ratio;
	canvas.height = height * ratio;
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	// now scale the context to counter
	// the fact that we've manually scaled our canvas element
	ctx.scale(ratio, ratio);
}//if

///////////////////////////////////////////////////////////////////////////
///////////////////////// Create global variables /////////////////////////
///////////////////////////////////////////////////////////////////////////

ctx.globalCompositeOperation = "multiply";

//Number of weeks in the year :)
var nWeeks = 52;

//Will save the coordinate mapping
var loc;

//The minimum and maximum values of the layer variable
var maxL = 0.8,
	minL = 0; //-0.06;

//Timer variables
var timer,
	stopAnimation = false;

///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Create scales /////////////////////////////
///////////////////////////////////////////////////////////////////////////

var xScale = d3.scaleLinear()
	.domain([1, 500])
	.range([0, width]);

var yScale = d3.scaleLinear()
	.domain([1, 250])
	.range([height, 0]);

var radiusScale = d3.scaleSqrt()
	.domain([minL, maxL])
	.range([0, 2.5])
	.clamp(true);

var opacityScale = d3.scaleLinear()
	.domain([minL, maxL])
	.range([1, 0.5]);

var greenColor = d3.scaleLinear()
	.domain([minL, maxL])
	.range(["#d9e537", "#008800"]);

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
	loc = coordRaw;
	
	data.forEach(function(d) {
		d.layer = +d.layer;
	});

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create first map ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Draw each circle
	data.forEach(function(d,i) {
		//Create each circle
		ctx.fillStyle = greenColor(d.layer);
		ctx.globalAlpha = opacityScale(d.layer);
		ctx.beginPath();
		ctx.arc(xScale(loc[i].x), yScale(loc[i].y), radiusScale(d.layer), 0, 2*Math.PI, 1);
		ctx.closePath();
		ctx.fill();
	});

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

}//function drawFirstMap

function drawAllMaps(error) {

	if (error) throw error;

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Final data preparation /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Create array that will hold all data
	maps = new Array(nWeeks);
	//Save each map in a variable, loop over it to make all variables numeric
	for (var i = 1; i < arguments.length; i++) {
		var data = arguments[i];
		data.forEach(function(d) {
			d.layer = +d.layer;
			d.color = d3.rgb(greenColor(d.layer));
			d.opacity = opacityScale(d.layer);
			d.size = radiusScale(d.layer);
		});
		//And save in a new array
		maps[(i-1)] = data;
	}//for i
	//Delete the arguments since we now have all the data in a new variable
	delete arguments;

	//I could not have done the part below without this great block 
	//https://bl.ocks.org/rflow/55bc49a1b8f36df1e369124c53509bb9
	//by Alastair Dant (@ajdant)

	//Animate the changes between states over time
	const fps = 3;
	const tweenTime = 1;
	const tweenFrames = fps * tweenTime;

	var counter = 0, 
		frame = 0, 
		progress = 0;

	var nCircles = maps[0].length;

	//Called every requestanimationframe
	function animate() {

		// track circles, states and scales
		var currValue, nextValue, value, i;
		var currColor, nextColor, r, g, b, color;
		var currSize, nextSize, size;
		var currOpacity, nextOpacity, opacity;

		//Track progress as proportion of frames completed
		frame = ++frame % tweenFrames;
		progress = (frame / tweenFrames) || 0;

		//console.log(counter, frame, progress);

		//Increment state counter once we've looped back around
		if (frame === 0) {
			counter = ++counter % nWeeks;
		};

		var currMap = maps[counter],
			nextMap = maps[(counter+1) % nWeeks];

		//Clear the previous map
		ctx.clearRect(0, 0, width, height);

		//Update scale and color of all circles by
		//Interpolating current state and next state
		for (i = 0; i < nCircles; i++) {

			//Trial and testing has taught me that it's best to 
			//do all of these values separately
			currSize = currMap[i].size;
			nextSize = nextMap[i].size;
			//Interpolate between them
			size = currSize + ((nextSize - currSize) * progress);

			currOpacity = currMap[i].opacity;
			nextOpacity = nextMap[i].opacity;
			//Interpolate between them
			opacity = currOpacity + ((nextOpacity - currOpacity) * progress);

			currColor = currMap[i].color;
			nextColor = nextMap[i].color;
			//Interpolate between them
			r = currColor.r + ((nextColor.r - currColor.r) * progress);
			g = currColor.g + ((nextColor.g - currColor.g) * progress);
			b = currColor.b + ((nextColor.b - currColor.b) * progress);
			color = d3.rgb(r,g,b);

			//Finally set the new values on the circle and draw
			ctx.fillStyle = color;
			ctx.globalAlpha = opacity;
			ctx.beginPath();
			ctx.arc(xScale(loc[i].x), yScale(loc[i].y), size, 0, 2*Math.PI, 1);
			ctx.closePath();
			ctx.fill();

		}//for i

		//Cue up next frame then render the updates
		requestAnimationFrame(animate);
	};

	animate();

	// //NOTE MAP 36 ISN'T COMPLETE - REDO DATA
	// var counter = 0;
	// timer = d3.interval(function() {	
	// //timer = setInterval(function() {

	// 	//Clear the previous map
	// 	ctx.clearRect(0, 0, width, height);

	// 	//Draw each circle
	// 	maps[counter].forEach(function(d,i) {
	// 		ctx.fillStyle = greenColor(d.layer);
	// 		ctx.globalAlpha = opacityScale(d.layer);
	// 		ctx.beginPath();
	// 		ctx.arc(xScale(loc[i].x), yScale(loc[i].y), radiusScale(d.layer), 0, 2*Math.PI, 1);
	// 		ctx.closePath();
	// 		ctx.fill();
	// 	});

	// 	//Get ready for the next map
	// 	counter = (counter+1)%52;

	// 	if (stopAnimation) { timer.stop(); } 

	// }, 100);

}//function drawAllMaps
