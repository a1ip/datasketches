///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set the PIXI stage ///////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = 2000; //document.body.clientWidth;
const mapRatio = 0.5078871;
const height = Math.round(mapRatio * width);

//Create the canvas
var renderer = new PIXI.autoDetectRenderer(width, height, { backgroundColor : 0xffffff, antialias: true });
//Add to the document
document.getElementById("chart").appendChild(renderer.view);
renderer.view.id = "canvas-map";

//Get the visible size back to 1000 px
renderer.view.style.width = (width*0.5) + 'px';
renderer.view.style.height = (height*0.5) + 'px';

//Create the root of the scene graph
var stage = new PIXI.Stage(0xFFFFFF); //or PIXI.Container(0xFFFFFF);

//var container = new PIXI.ParticleContainer(50000, [true, true, false, false, true]);
var container = new PIXI.Container(0xFFFFFF);
stage.addChild(container);

//Create a texture to be used as a Sprite from a white circle png image
const circleTexture = new PIXI.Texture.fromImage("circle.png");

///////////////////////////////////////////////////////////////////////////
///////////////////////// Create global variables /////////////////////////
///////////////////////////////////////////////////////////////////////////

//Number of weeks in the year :)
const nWeeks = 52;

//Will save the coordinate mapping
var loc;

//The minimum and maximum values of the layer variable
const maxL = 0.8,
	  minL = 0; //-0.06;

//Will stop the animation
var animate;
var stopAnimation = false;

//Will save the drawn circle settings
var dots = [];

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
	//Save the variable to global
	loc = coordRaw	

	data.forEach(function(d) {
		d.layer = +d.layer;
	});

	//Adjust the title
	d3.select("#week").text("Week " + 22 + ", " + months[22-1] + ", 2016");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create first map ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Draw each circle
	data.forEach(function(d,i) {
		//Get the color in the weird hex format
		var fill = d3.rgb(greenColor(d.layer));
		var color = color = (fill.r << 16) + (fill.g << 8) + fill.b;

		var dot = new PIXI.Sprite(circleTexture);
		dot.tint = color;
		dot.blendMode = PIXI.blendModes.MULTIPLY;
		dot.anchor.x = 0.5;
		dot.anchor.y = 0.5;
		dot.position.x = xScale(loc[i].x);
		dot.position.y = yScale(loc[i].y);
		dot.scale.x = dot.scale.y = pixelScale(d.layer);
		dot.alpha = opacityScale(d.layer);

		//Save the circle
		dots[i] = dot;

		//Add to the container
		container.addChild(dot);
	});//forEach

	//Render to the screen
	renderer.render(stage);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw the other maps //////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	setTimeout(function() {
		console.log("reading in maps");
		//Create a queue that loads in all the files first, before calling the draw function
		var q = d3.queue();

		for(var i = 0; i < nWeeks; i++) {
			//Add each predefined file to the queue
			q = q.defer(d3.csv, "../../../data/nadieh/VIIRS/mapData-week-" + (i+1) + ".csv");
		}//for i
		q.await(drawAllMaps);
	}, 2000);

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
			d.size = pixelScale(d.layer);
		});
		//And save in a new array
		maps[(i-1)] = data;
	}//for i
	//Delete the arguments since we now have all the data in a new variable
	delete arguments;

	console.log("prepared all maps");

	d3.select("#stopstart").text("stop the animation");
	//Function attached to the stop/start button
	d3.select("#stopstart").on("click", function() { 
		if(!stopAnimation) {
			stopAnimation = true;
			d3.select(this).text("restart the animation");
		} else {
			stopAnimation = false;
			d3.select(this).text("stop the animation");
			animate();
		}//else 
	});

	//I could not have done the part below without this great block 
	//https://bl.ocks.org/rflow/55bc49a1b8f36df1e369124c53509bb9
	//to make it performant, by Alastair Dant (@ajdant)

	//Animate the changes between states over time
	const fps = 5;
	const tweenTime = 2;
	const tweenFrames = fps * tweenTime;

	var counter = 0, 
		frame = 0, 
		progress = 0;

	//Called every requestanimationframe
	animate = function() {
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
			//Adjust the title
			d3.select("#week").text("Week " + (counter+1) + ", " + months[counter] + ", 2016");
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
		if(!stopAnimation) requestAnimationFrame(animate);
		renderer.render(stage);
	};

	animate();

}//function drawAllMaps


