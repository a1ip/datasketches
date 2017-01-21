function createCharacterLegend(characters, names, data) {
	
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var width = document.getElementById("character-legend").clientWidth;

	var size = width*0.9 / 16;

	var margin = {
	  top: 2.2*size,
	  right: 2.2*size,
	  bottom: 2.2*size,
	  left: 2.2*size
	};
	width = width - margin.left - margin.right;
	var height = 8*size - margin.top - margin.bottom;
		
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
	////////////////////////// Create defs elements ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Container for the gradients
	var defs = svg.append("defs");

	//Create wrapper for the clip paths
	var imageWrapper = defs.append("g").attr("class", "image-group-wrapper");

	//Create a circle with an image for the main characters
	imageWrapper.selectAll(".character-legend-image")
		.data(data)
		.enter().append("pattern")
		.attr("id", function(d) { return "character-legend-" + d.replace(" ", "_"); })
		.attr("class", "character-legend-image")
		.attr("patternUnits","objectBoundingBox")
		.attr("height", "100%")
		.attr("width", "100%")
		.append("image")
			.attr("xlink:href", function(d) { return "img/" + d + ".jpg"; })
			//.attr("x", function(d) { return isMobile ? sagaScale(d.hExtraMobile) : sagaScale(d.hExtra); })
			.attr("height", 2*size);	

	//Code taken from http://stackoverflow.com/questions/9630008/how-can-i-create-a-glow-around-a-rectangle-with-svg
	//Filter for the outside glow
	var filter = defs.append("filter")
	  .attr("id","glow");

	filter.append("feGaussianBlur")
	  .attr("stdDeviation","2")
	  .attr("result","coloredBlur");

	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
	  .attr("in","coloredBlur");
	feMerge.append("feMergeNode")
	  .attr("in","SourceGraphic");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////////// Add texts /////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	svg.append("text")
		.attr("class","character-legend-text")
		.attr("x", -margin.left)
		.attr("y", -size*1.5)
		.attr("dy", "0.3em")
		.text("Main protagonists");

	///////////////////////////////////////////////////////////////////////////
	//////////// Create a circle with image for the main characters ///////////
	///////////////////////////////////////////////////////////////////////////

	var characterCircleWrapper = svg.append("g").attr("class", "character-legend-wrapper");

	//Add the circles that will be filled with images
	var characterCircle = characterCircleWrapper.selectAll(".character-legend-group")
		.data(data)
		.enter().append("g")
		.attr("class", "character-legend-group")
		.attr("transform", function(d,i) { return "translate(" + (i%6 * size * 2.25) + "," + (Math.floor(i/6) * size * 2.75) + ")"; });
		
	//Append the circle itself
	characterCircle.append("circle")
		.style("fill", function(d) { return "url(#character-legend-" + d.replace(" ","_") + ")"; })
		.attr("r", size)
		.style("stroke", function(d,i) { return characters[names.indexOf(d)].color; })
		.style("stroke-width", strokeScale(size) )
		.on("mouseover", function(d) {
			//Move the circle to the front
			d3.select(this.parentNode).raise();
			//Increase the scale of the image
			d3.select(this)
				.style("filter", "url(#glow)")
				.transition("grow").duration(600)
				.attr("transform", "scale(" + 2 + ")");
		})
		.on("mouseout", function(d) {
			//Decrease the scale of the image
			d3.select(this)
				.style("filter", null)
				.transition("grow").duration(400)
				.attr("transform", "scale(" + 1 + ")");
		});

}//createCharacterLegend

