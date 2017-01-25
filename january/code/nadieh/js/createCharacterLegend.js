function createCharacterLegend(characters) {
	
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var width = document.getElementById("character-legend").clientWidth;

	//Fixed size for the circles
	var size = 35,
		sizeSmall = 35/2,
		circleRatio = 1.15;

	var marginSize = Math.round(1.2*size);
	var margin = {
	  top: marginSize*1.75, //To fit title
	  right: marginSize,
	  bottom: marginSize,
	  left: marginSize
	};
	width = width - margin.left - margin.right;
	var height = 8*size;
		
	//SVG container
	var svg = d3.select('#character-legend')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

	//Scale the stroke of the circles depending on the size of the circles
	var strokeScale = d3.scaleLinear()
		.domain([10, 50])
		.range([1, 4]);

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create legend data ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var mainProtagonists = [
		{character: "Goku", text: "The main character of the series. Goku is "},
		{character: "Piccolo", text: ""},
		{character: "Krillin", text: ""},
		{character: "Gohan", text: ""},
		{character: "Future Trunks", text: ""},
	];

	var subProtagonists = [
		{character: "Tien Shinhan", text: ""},
		{character: "Chiaotzu", text: ""},
		{character: "Yamcha", text: ""},
		{character: "Trunks", text: ""},
		{character: "Goten", text: ""},
		{character: "Mr. Satan", text: ""},
		{character: "Gotenks", text: ""},
		{character: "Vegito", text: ""},
	];
	//Videl, Chi-Chi

	var mainAntagonists = [
		{character: "Raditz", text: ""},
		{character: "Vegeta", text: ""},
		{character: "Frieza", text: ""},
		{character: "Cell", text: ""},
		{character: "Buu", text: ""},
	];

	var subAntagonists = [
		{character: "Nappa", text: ""},
		{character: "Captain Ginyu", text: ""},
		{character: "Android 19", text: ""},
		{character: "Android 20", text: ""},
		{character: "Android 16", text: ""},
		{character: "Android 17", text: ""},
		{character: "Android 18", text: ""},
		{character: "Cell Jr.", text: ""},
		{character: "Babidi", text: ""},
		{character: "Dabura", text: ""},
	];
	//Saibaman, Jeice, Burter, Dodoria, Recoome, Zarbon, Guldo, Evil Buu, King Cold, Spopovich

	//Also one array with all names
	var allCharaters = mainProtagonists.concat(mainAntagonists).concat(subProtagonists).concat(subAntagonists);

	//? Olibu, Supreme Kai, Yakon, Banan, Cui, Jewel, Kibito, Killa, Pikkon, Pinar, Pui Pui, Scarface, Shorty, Sui
	//Not important: Wild Tiger, Nail, Pan, Uub, Yajirobe

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create defs elements ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Container for the gradients
	var defs = svg.append("defs");

	//Create wrapper for the clip paths
	var imageWrapper = defs.append("g").attr("class", "image-group-wrapper");

	//Create a circle with an image for the main characters
	imageWrapper.selectAll(".character-legend-image")
		.data(allCharaters)
		.enter().append("pattern")
		.attr("id", function(d) { return "character-legend-" + d.character.replace(" ", "_"); })
		.attr("class", "character-legend-image")
		.attr("patternUnits", "objectBoundingBox")
		.attr("height", "100%")
		.attr("width", "100%")
		.append("image")
			.attr("xlink:href", function(d) { return "img/" + d.character + ".jpg"; })
			.attr("height", function(d,i) { 
				var smallSize = i >= 10 ? 0.5 : 1;
				return 2*size*smallSize; 
			});	

	//Code taken from http://stackoverflow.com/questions/9630008/how-can-i-create-a-glow-around-a-rectangle-with-svg
	//Filter for the outside glow
	var filter = defs.append("filter")
	  	.attr("id","glow")
	  	.attr("x", "-25%")
		.attr("y", "-25%")
	  	.attr("height", "150%")
	  	.attr("width", "150%");

	filter.append("feGaussianBlur")
	  .attr("stdDeviation","2")
	  .attr("result","coloredBlur");

	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
	  .attr("in","coloredBlur");
	feMerge.append("feMergeNode")
	  .attr("in","SourceGraphic");

	//Create a gradient to fill the lines from the annotations circles to the fights
	var titleGradient = defs.append("linearGradient")             
		.attr("id", "legend-title-gradient")   
		.attr("x1", 0).attr("y1", 0)         
		.attr("x2", 1).attr("y2", 1);
	titleGradient.append("stop").attr("offset", "0%").attr("stop-color", "#FFC200");
	titleGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ff6c00");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Place the titles /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Add protagonist title on top
	var pText = svg.append("text")
		.attr("class","character-legend-text")
		.attr("x", width/2)
		.attr("y", -size*1.75)
		.attr("dy", "0.3em")
		.style("fill", "url(#legend-title-gradient)")
		.text("Protagonists");

	//Add antagonist title on top
	var aText = svg.append("text")
		.attr("class","character-legend-text")
		.attr("x", width/2)
		.attr("dy", "0.3em")
		.style("fill", "url(#legend-title-gradient)")
		.text("");

	///////////////////////////////////////////////////////////////////////////
	//////////// Create a circle with image for the main characters ///////////
	///////////////////////////////////////////////////////////////////////////

	var characterCircleWrapper = svg.append("g").attr("class", "character-legend-wrapper");

	var finalRow = 0;
	finalRow = drawCircles(mainProtagonists, "main-protagonists", finalRow, "big");
	finalRow = drawCircles(subProtagonists, "sub-protagonists", finalRow + 2*size*0.9, "small");

	//Set in the right location
	aText
		.attr("y", finalRow + 3.5*size -size*1.75)
		.text("Antagonists");

	finalRow = drawCircles(mainAntagonists, "main-antagonists", finalRow + 3.5*size, "big");
	finalRow = drawCircles(subAntagonists, "sub-antagonists", finalRow + 2*size*0.9, "small");

	//Readjust the height to accomodate all the charcters
	d3.select('#character-legend svg').attr("height", finalRow + margin.top + margin.bottom);

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Function to draw the circles /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	function drawCircles(data, className, yOffset, type) {

		if(type === "small") {
			var scaleIncrease = 3;
			var s = size/2;
			var cr = 1.2;
			var extraWidth = marginSize;
		} else {
			var scaleIncrease = 2;
			var s = size;
			var cr = circleRatio;
			var extraWidth = 0;
		}//else

		//Save the location of the final row, so the next group can be placed under it in the next function call
		var finalRow;

		var circleTotalWidth = (2*s * cr),
			numPerRow = Math.round( (extraWidth + width) / circleTotalWidth ),
			remainingWidth = round2( (extraWidth + width) - numPerRow * circleTotalWidth)/2,
			remainingCircle = data.length % numPerRow,
			numRows = Math.ceil(data.length / numPerRow);

		//If there are only two rows, divide them up nicely
		if(numRows === 2) {
			numPerRow = Math.ceil(data.length/2) + (data.length%2 === 0 ? 1 : 0);
			remainingWidth = round2( (extraWidth + width) - numPerRow * circleTotalWidth)/2;
			remainingCircle = data.length % numPerRow;
		}//if

		//Add the circles that will be filled with images
		var characterCircle = characterCircleWrapper.selectAll("." + className)
			.data(data)
			.enter().append("g")
			.attr("class", "character-legend-group " + className)
			.attr("transform", function(d,i) { 
				var offsetX = 0.5;
				//If there is anything left for the last row that isn't exactly numPerRow
				if(i >= data.length - remainingCircle) offsetX = (numPerRow - remainingCircle) * offsetX + offsetX;
				if(i === data.length-1) finalRow = yOffset + Math.floor(i/numPerRow) * circleTotalWidth;

				return "translate(" + (- extraWidth/2 + remainingWidth + offsetX*circleTotalWidth + i%numPerRow * circleTotalWidth) + "," + 
					(yOffset + Math.floor(i/numPerRow) * circleTotalWidth) + ")"; 
			});
			
		//Append the circle itself
		characterCircle.append("circle")
			.style("fill", function(d) { return "url(#character-legend-" + d.character.replace(" ","_") + ")"; })
			.attr("r", s)
			.style("stroke", function(d,i) { 
				var colorPos = characters.map(function(m) { return m.character; }).indexOf(d.character);
				var color =  colorPos > -1 ? characters[colorPos].color : "#c1c1c1";
				return color ; 
			})
			.style("stroke-width", strokeScale(s) )
			.on("mouseover", function(d) {
				//Move the circle to the front
				d3.select(this.parentNode).raise();
				//Increase the scale of the image
				d3.select(this)
					.style("filter", "url(#glow)")
					.transition("grow").duration(600)
					.attr("transform", "scale(" + scaleIncrease + ")");
			})
			.on("mouseout", function(d) {
				//Decrease the scale of the image
				d3.select(this)
					.style("filter", null)
					.transition("grow").duration(400)
					.attr("transform", "scale(1)");
			});

		return finalRow;

	}//function drawCircles

}//createCharacterLegend

