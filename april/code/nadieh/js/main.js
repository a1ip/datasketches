///////////////////////////////////////////////////////////////////////////
////////////////////////////// Mobile or not //////////////////////////////
///////////////////////////////////////////////////////////////////////////

//If it's too small, thus most likely mobile, tell them to watch on pc
var isMobile = mobileAndTabletcheck(); //window.innerWidth < 400;
if(isMobile) {

	d3.selectAll(".mobile").style("display", "block");
	//Change text in the "stop/start" button
	d3.select("#stopstart")
		.text("for the animation through all 52 weeks, please go to a desktop. I promise it looks mesmerizing!")

	//Adjust the title above the map
	d3.select("#week").text("Week 23, June, 2016");

	//Create the legend for the image
	createLegend();

} else {
	//Call the function
	createLegend();
	createPixiMap(isMobile);
}//else

//Create the legend below the visual
function createLegend() {

	//Green color scale
	var greenColor = d3.scaleLinear()
		.domain([-0.08, 0.1, 0.8])
		.range(["#FAECAB", "#f2ec82", "#0c750c"]);

	var legendWidth = 300,
		legendHeight = 6;

	//SVG container
	var svg = d3.select('#legend')
		.append("svg")
		.attr("width", legendWidth + 140)
		.attr("height", legendHeight + 30)
		.append("g")
		.attr("transform", "translate(" + 70 + "," + 15 + ")");

	//Create the gradient	
	var gradient = svg.append("defs").append("linearGradient")
		.attr("id", "gradient-legend")
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%");
	//Add colors
	gradient.selectAll("stop") 
		.data(d3.range(5))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return i/(6-1); })   
		.attr("stop-color", function(d,i) { return greenColor(-0.1 + i/6); });
	//Add one more stop that is mostly due to the multiply blending effect
	gradient.append("stop") 
		.attr("offset", 1)   
		.attr("stop-color", "#103F0C");

	//Draw the rectangle
	svg.append("rect")
		.attr("class", "legend-rect")
		.attr("x", 0)
		.attr("y", 10)
		.attr("rx", legendHeight/2)
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.style("fill", "url(#gradient-legend)");
		
	//Append title to legend
	svg.append("text")
		.attr("id", "legend-title")
		.attr("x", legendWidth/2)
		.attr("y", 0)
		.text("Vegetation health - Greenness");

	//Append left and right sides to legend
	svg.append("text")
		.attr("class", "legend-value")
		.attr("x", 0 - 8)
		.attr("y", 10)
		.attr("dy", "0.65em")
		.style("text-anchor", "end")
		.text("low | arid");
	svg.append("text")
		.attr("class", "legend-value")
		.attr("x", legendWidth + 8)
		.attr("y", 10)
		.attr("dy", "0.65em")
		.style("text-anchor", "start")
		.text("high | lush");

}//function createLegend

//Function to draw the pixiJS based map
function createPixiMap(isMobile) {

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set the PIXI stage ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const width = 2000; //document.body.clientWidth;
	const mapRatio = 0.5078871;
	const height = Math.round(mapRatio * width);

	//Create the canvas
	var renderer = new PIXI.autoDetectRenderer(width, height, { backgroundColor : 0xFFFFFF, antialias: true });
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
	const circleTexture = new PIXI.Texture.fromImage("img/circle.png");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Create global variables /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const nWeeks = 52;						//Number of weeks in the year
	const startMap = isMobile ? 22 : 12;	//The week of the first map to be drawn

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
		.domain([-0.08, 0.1, maxL])
		.range(["#FAECAB", "#f2ec82", "#0c750c"]);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Read in the data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Adjust the title
	d3.select("#week").text("Week " + (startMap+1) + ", " + months[startMap] + ", 2016 | loading all 52 weeks...");

	d3.queue() 
		.defer(d3.csv, "../../data/nadieh/worldMap_coordinates.csv")
		.defer(d3.csv, "../../data/nadieh/VIIRS/mapData-week-" + startMap +".csv")
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
		loc = coordRaw;	

		data.forEach(function(d) {
			d.layer = +d.layer;
			d.color = d3.rgb(greenColor(d.layer));
			d.opacity = opacityScale(d.layer);
			d.size = pixelScale(d.layer);
		});

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Create first map ////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		//Draw each circle
		data.forEach(function(d,i) {
			//Get the color in the weird hex format
			var color = (d.color.r << 16) + (d.color.g << 8) + d.color.b;

			var dot = new PIXI.Sprite(circleTexture);
			dot.tint = color;
			dot.blendMode = PIXI.blendModes.MULTIPLY;
			dot.anchor.x = 0.5;
			dot.anchor.y = 0.5;
			dot.position.x = xScale(loc[i].x);
			dot.position.y = yScale(loc[i].y);
			dot.scale.x = dot.scale.y = d.size;
			dot.alpha = d.opacity;

			//Save the circle
			dots[i] = dot;

			//Add to the container
			container.addChild(dot);
		});//forEach

		//Render to the screen
		setTimeout(function() { renderer.render(stage); }, 1000);

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// Draw the other maps //////////////////////////
		///////////////////////////////////////////////////////////////////////////
		
		if(!isMobile) {
			setTimeout(function() {
				console.log("reading in maps");
				//Create a queue that loads in all the files first, before calling the draw function
				var q = d3.queue();

				for(var i = 0; i < nWeeks; i++) {
					//Add each predefined file to the queue
					q = q.defer(d3.csv, "../../data/nadieh/VIIRS/mapData-week-" + (i+1) + ".csv");
				}//for i
				q.await(drawAllMaps);
			}, 1000);
		}//if

	}//function drawFirstMap

	function drawAllMaps(error) {

		if (error) throw error;

		///////////////////////////////////////////////////////////////////////////
		////////////////////////// Final data preparation /////////////////////////
		///////////////////////////////////////////////////////////////////////////

		console.log("preparing map data");

		//Create array that will hold all data
		var rawMaps = arguments;
		maps = new Array(nWeeks);

		//Save each map in a variable, loop over it to make all variables numeric
		//From: https://github.com/tungs/breathe and https://breathejs.org/Using-Breathe.html
		breathe.times(nWeeks+1, function(i) {
			if(i !== 0) {
				var data = rawMaps[i];
				data.forEach(function(d) {
					d.layer = +d.layer;
					d.color = d3.rgb(greenColor(d.layer));
					d.opacity = opacityScale(d.layer);
					d.size = pixelScale(d.layer);
				});
				//And save in a new array
				maps[(i-1)] = data;
			}//if
		})
		.then(function() {
			//Run after the map data loop above is finished
			console.log("prepared all maps, starting animation");

			//Delete the arguments since we now have all the data in a new variable
			delete arguments;
			delete rawMaps;

			d3.select("#stopstart")
				.style("cursor", "pointer")
				.text("stop the animation");
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

			//Start the animation
			animate();
		});

		// //Old standard loop function
		// for (var i = 1; i < arguments.length; i++) {
		// 	var data = arguments[i];
		// 	data.forEach(function(d) {
		// 		d.layer = +d.layer;
		// 		d.color = d3.rgb(greenColor(d.layer));
		// 		d.opacity = opacityScale(d.layer);
		// 		d.size = pixelScale(d.layer);
		// 	});
		// 	//And save in a new array
		// 	maps[(i-1)] = data;
		// }//for i

		//I could not have done the part below without this great block 
		//https://bl.ocks.org/rflow/55bc49a1b8f36df1e369124c53509bb9
		//to make it performant, by Alastair Dant (@ajdant)

		//Animate the changes between states over time
		const fps = 5;
		const tweenTime = 2;
		const tweenFrames = fps * tweenTime;

		var counter = startMap-1, 
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
			renderer.render(stage);
			if(!stopAnimation) requestAnimationFrame(animate);
		};

		//animate();

	}//function drawAllMaps

}//function drawPixiMap

//http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function mobileAndTabletcheck() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
