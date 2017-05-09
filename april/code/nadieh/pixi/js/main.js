var mapRatio = 0.5078871;

var width = 2000; //document.body.clientWidth; 
var height = Math.round(mapRatio * width);

//Create the canvas
var renderer = new PIXI.autoDetectRenderer(width, height, { backgroundColor : 0xffffff, antialias: true });
renderer.view.className = "rendererView";
//renderer.setBlendMode = PIXI.blendModes.MULTIPLY;
//Add to the document
document.getElementById("chart").appendChild(renderer.view);

//Get the visible size back to 1000 px
renderer.view.style.width = (width*0.5) + 'px';
renderer.view.style.height = (height*0.5) + 'px';

//Create the root of the scene graph
var stage = new PIXI.Stage(0xFFFFFF); //or PIXI.Container(0xFFFFFF); or PIXI.Stage(0xFFFFFF);

//var container = new PIXI.ParticleContainer(50000, [true, true, false, false, true]);
var container = new PIXI.Container(0xFFFFFF);
stage.addChild(container);

//var circleTexture = new PIXI.Texture.fromImage("pixel.png");
var circleTexture = new PIXI.Texture.fromImage("circle.png");

///////////////////////////////////////////////////////////////////////////
///////////////////////// Create global variables /////////////////////////
///////////////////////////////////////////////////////////////////////////

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

var dots = [];
var circles = [];

///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Create scales /////////////////////////////
///////////////////////////////////////////////////////////////////////////

var xScale = d3.scaleLinear()
	.domain([1, 500])
	.range([0, width]);

var yScale = d3.scaleLinear()
	.domain([1, 250])
	.range([height, 0]);

// var radiusScale = d3.scaleSqrt()
// 	.domain([minL, maxL])
// 	.range([0, 2.5])
// 	.clamp(true);
var pixelScale = d3.scaleSqrt()
	.domain([minL, maxL])
	.range([0, 0.65])
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
	loc = coordRaw	

	data.forEach(function(d) {
		d.layer = +d.layer;
	});

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create first map ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	console.log("adding circles");

	//Draw each circle
	data.forEach(function(d,i) {
		//Get the color in the weird hex format
		var finalFill = +("0x" + tinycolor(greenColor(d.layer)).toHex());

		var dot = new PIXI.Sprite(circleTexture);
		//var dot = new PIXI.Sprite(tex);
		dot.tint = finalFill;
		dot.blendMode = PIXI.blendModes.MULTIPLY;
		dot.anchor.x = 0.5;
		dot.anchor.y = 0.5;
		dot.position.x = xScale(loc[i].x);
		dot.position.y = yScale(loc[i].y);
		dot.scale.x = dot.scale.y = pixelScale(d.layer);
		dot.alpha = opacityScale(d.layer);

		dots[i] = dot;

		container.addChild(dot);
	});//forEach

	console.log("rendering");
	renderer.render(stage);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw the other maps //////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	console.log("reading in maps");

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

	console.log("loaded all maps");

	//Create array that will hold all data
	maps = new Array(nWeeks);
	//Save each map in a variable, loop over it to make all variables numeric
	for (var i = 1; i < arguments.length; i++) {
		var data = arguments[i];
		data.forEach(function(d) {
			d.layer = +d.layer;
			d.color = d3.rgb(greenColor(d.layer));
			d.opacity = opacityScale(d.layer);
			d.size = pixelScale(d.layer);
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
	const fps = 5;
	const tweenTime = 2;
	const tweenFrames = fps * tweenTime;

	var counter = 0, 
		frame = 0, 
		progress = 0;

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

		//Update scale and color of all circles by
		//Interpolating current state and next state
		for (i = 0; i < dots.length; i++) {

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
			color = (r << 16) + (g << 8) + b;

			//Finally set the new values on the circle
			dots[i].scale.x = dots[i].scale.y = size;
			dots[i].tint = color;
			dots[i].alpha = opacity;

		}//for i

		//Cue up next frame then render the updates
		requestAnimationFrame(animate);
		renderer.render(stage);
	};

	animate();

}//function drawAllMaps


