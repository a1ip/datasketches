//Size
var width = 2600,
    height = 1500;
	
//Reset the overall font size
// var newFontSize = Math.min(70, Math.max(40, innerRadius * 62.5 / 250));
// d3.select("html").style("font-size", newFontSize + "%");

var outerRadius = 280,
	innerRadius = 50,
	featherPadding = 1.5,
	medalDegree = 320/(49*2),
	arcHeight = 7,
	genderOffset = 1;

////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////
			
var svg = d3.select("#olympic-chart").append("svg")
    .attr("width", width)
    .attr("height", height);

////////////////////////////////////////////////////////////
///////////////////// Read in data /////////////////////////
////////////////////////////////////////////////////////////

d3.json('../../data/nadieh/olympic_feathers.json', function (error, data) {

	if (error) throw error;
	
	////////////////////////////////////////////////////////////
	//////////////////// Colors & Scales ///////////////////////
	////////////////////////////////////////////////////////////
					
	//Although not designed to represent continents (https://en.wikipedia.org/wiki/Olympic_symbols) 
	//I will use the general accepted coloring of:
	//Americas - Red
	//Europe - Blue
	//Africa - Black
	//Asia - Yellow
	//Oceania - Green
	//Mixed - all of them - gradient

	//Colors for the medals
	var color = d3.scaleOrdinal()
    	.domain(["Americas","Europe","Africa","Asia","Oceania","Mixed"])
    	.range(["#EA1F46","#1482C6","#242021","#FAB349","#17A554","pink"])
    	.unknown("#d2d2d2");

    var timeScale = d3.scaleLinear()
    	.domain([1896, 2016])
    	.range([innerRadius, outerRadius]);

	var arc = d3.arc()
    	.outerRadius(function(d) { return timeScale(d.edition) + arcHeight; })
    	.innerRadius(function(d) { return timeScale(d.edition); })
    	.startAngle(function(d) { 
    		//Towards the left for women and right for men
    		var sign = d.gender === "Men" ? 1 : -1;
    		return sign * ( (d.startMedalCount * medalDegree) * Math.PI/180);// + 1/timeScale(d.edition) ); 
    	})
    	.endAngle(function(d) { 
    		//Towards the left for women and right for men
    		var sign = d.gender === "Men" ? 1 : -1;
    		return sign * ( ((d.startMedalCount + d.medalCount) * medalDegree) * Math.PI/180);// + 1/timeScale(d.edition) ); 
    	});

	////////////////////////////////////////////////////////////
	/////////////////// Create tails/circles ///////////////////
	////////////////////////////////////////////////////////////

	//Locations of each circle
	var topHeight = 2/7,
		bottomHeight = 5/7;
	circleLocations = [
		{id: 1, x: width/6, y: height*topHeight},
		{id: 2, x: width/3, y: height*bottomHeight},
		{id: 3, x: width/2, y: height*topHeight},
		{id: 4, x: width*2/3, y: height*bottomHeight},
		{id: 5, x: width*5/6, y: height*topHeight}
	];

	//Create a group for each circle
	var tails = svg.selectAll(".tail")
		.data(data)
		.enter().append("g")
		.attr("class", function(d,i) { return "tail " + removeSpace(d.group); })
		.attr("transform", function(d,i) { 
			d.circleRotation = 180 + (360 - 2 * d.maxMedals * medalDegree - (d.disciplines.length - 1) * featherPadding)/2;
			return "translate(" + circleLocations[i].x + "," + circleLocations[i].y + ")" +
					"rotate(" + d.circleRotation + ")"; 
		});

	////////////////////////////////////////////////////////////
	///////////////////// Create feathers //////////////////////
	////////////////////////////////////////////////////////////

	var feathers = tails.selectAll(".feather")
		.data(function(d) { return d.disciplines; })
		.enter().append("g")
		.attr("class", function(d,i) { return "feather " + removeSpace(d.discipline); })
		.attr("transform", function(d,i) {
			d.angle = (2*d.featherOffset + d.maxMedals) * medalDegree + i * featherPadding; 
			return "rotate(" + d.angle + ")"; 
		});

	var clippedFeathers = feathers
		.append("g")
		.attr("class", "feather-clipped")
		.attr("clip-path", function(d) { return "url(#clip-" + removeSpace(d.discipline); })
		.style("clip-path", function(d) { return "url(#clip-" + removeSpace(d.discipline); }) //make it work in safari;

	//Create another group inside the feathers that will be clipped to a feather shape
	clippedFeathers.append("path")
		.attr("class", "feather-background")
		.attr("d", function(d) {
			var angle = d.maxMedals * medalDegree * Math.PI/180,
				curveAngle = 0.5 * angle;
			var startPoint = -timeScale.range()[0],
				radiusLine = -timeScale(2020),
				curveLine = -timeScale(2020),
				topPoint = -timeScale(2034);

			var arcSettingsTop = 2*angle > Math.PI ? " 0 1,1" : " 0 0,1";
			var arcSettingsBottom = 2*angle > Math.PI ? " 0 1,0" : " 0 0,0";

			d.featherArc = "M" + startPoint * Math.sin(angle) + "," + startPoint * Math.cos(angle) + 
					" L" + radiusLine * Math.sin(angle) + "," + radiusLine * Math.cos(angle) +
					" A " + radiusLine + "," + radiusLine + arcSettingsTop + radiusLine * Math.sin(-angle) + "," + radiusLine * Math.cos(-angle) + 
					" L" + startPoint * Math.sin(-angle) + "," + startPoint * Math.cos(-angle) + 
					" A " + startPoint + "," + startPoint + arcSettingsBottom + startPoint * Math.sin(angle) + "," + startPoint * Math.cos(angle);

			// if(d.maxMedals < 5) {
			// 	d.featherArc = "M" + startPoint * Math.sin(angle) + "," + startPoint * Math.cos(angle) + 
			// 			" L" + radiusLine * Math.sin(angle) + "," + radiusLine * Math.cos(angle) +
			// 			" Q" + curveLine * Math.sin(angle) + "," + curveLine * Math.cos(angle) + " " + 0 + "," + topPoint +
			// 			" Q" + curveLine * Math.sin(-angle) + "," + curveLine * Math.cos(-angle) + " " + radiusLine * Math.sin(-angle) + "," + radiusLine * Math.cos(-angle) +
			// 			" L" + startPoint * Math.sin(-angle) + "," + startPoint * Math.cos(-angle) + 
			// 			" A " + startPoint + "," + startPoint + " 0 0,0 " + startPoint * Math.sin(angle) + "," + startPoint * Math.cos(angle);
			// } else {
			// 	//Find an approximate number of mini feather points to create
			// 	var numPoints = d.maxMedals / 2.3;
			// 	//Pick the closest uneven number
			// 	numPoints = (Math.floor(numPoints)%2 === 1 ? Math.floor(numPoints) : Math.ceil(numPoints));


			// 	var angleMini = 2*angle / numPoints;
			// 	var radiusLineMini = -timeScale(2020),
			// 		curveLineMini = -timeScale(2024);

			// 	var arcSettings = 2*angle > Math.PI ? " 0 1,0" : " 0 0,0";

			// 	//Starting line
			// 	d.featherArc = "M" + startPoint * Math.sin(angle) + "," + startPoint * Math.cos(angle) + 
			// 			" L" + radiusLine * Math.sin(angle) + "," + radiusLine * Math.cos(angle);
			// 	//Inner sections
			// 	for(var j = 0; j < numPoints; j++) {
			// 		//For the last point make it end at the same radius as a normal feather
			// 		if(j === numPoints - 1) { radiusLineMini = radiusLine; }

			// 		d.featherArc = d.featherArc + " Q" + curveLineMini * Math.sin(angle - j*angleMini) + "," + curveLineMini * Math.cos(angle - j*angleMini) + " " + topPoint * Math.sin(angle - (j+0.5)*angleMini)  + "," + topPoint  * Math.cos(angle - (j+0.5)*angleMini) +
			// 									  " Q" + curveLineMini * Math.sin(angle - (j+1)*angleMini) + "," + curveLineMini * Math.cos(angle - (j+1)*angleMini) + " " + radiusLineMini * Math.sin(angle - (j+1)*angleMini) + "," + radiusLineMini * Math.cos(angle - (j+1)*angleMini);
			// 	}//for j
			// 	d.featherArc = d.featherArc + " L" + startPoint * Math.sin(-angle) + "," + startPoint * Math.cos(-angle) +
			// 					" A " + startPoint + "," + startPoint + arcSettings + startPoint * Math.sin(angle) + "," + startPoint * Math.cos(angle);;

			// }//else

			return d.featherArc;
		});

	//Create the feather shaped clipping paths
	var defs = feathers.append("defs");
	//Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
        .attr("id", function(d,i) { return "clip-" + removeSpace(d.discipline); })
        .append("path")
        .attr("d", function(d) { return d.featherArc; });

	////////////////////////////////////////////////////////////
	//////////////// Create inside of feathers /////////////////
	////////////////////////////////////////////////////////////

	var editions = clippedFeathers.selectAll(".edition")
		.data(function(d) { return d.editions; })
		.enter().append("g")
		.attr("class", function(d,i) { return "edition year_" + d.edition; });

	var genders = editions.selectAll(".genders")
		.data(function(d) { return d.genders; })
		.enter().append("g")
		.attr("class", function(d,i) { return "gender " + d.gender; });
	
	//Finally append the paths
	genders.selectAll("path")
    	.data(function(d) { return d.continents; })
    	.attr("class", function(d,i) { return "continent " + d.continent; })
  		.enter().append("path")
    	.style("fill", function(d) { return color(d.continent); })
    	//.style("opacity", 0.4)
    	.attr("d", arc);

	////////////////////////////////////////////////////////////
	////////////////////// Append Names ////////////////////////
	////////////////////////////////////////////////////////////

	//Append the label names on the outside - has to happen away from the clip path
	feathers.append("text")
	  	.attr("dy", ".35em")
	  	.attr("class", "discipline-title")
	  	.attr("text-anchor", function(d) { 
	  		return (d.angle + this.parentNode.parentNode.__data__.circleRotation) > 360 ? "start" : "end"; 
	  	})
	  	.attr("transform", function(d) {
			return "rotate(90)translate(" + -timeScale(2028) + ")"
			+ ((d.angle + this.parentNode.parentNode.__data__.circleRotation) > 360 ? "rotate(180)" : "");
	  	})
	  	.text(function(d,i) { return d.discipline; });

	////////////////////////////////////////////////////////////
	//////////////// Append Center Gender Line /////////////////
	////////////////////////////////////////////////////////////

	//Create a line to split the genders
	clippedFeathers.append("line")
		.attr("class", "time-line")
		.attr("y1", -timeScale(1896))
		.attr("y2", -timeScale(2020));

	var yearArc = d3.arc()
		.outerRadius(function(d) { return timeScale(d) + 1; })
		.innerRadius(function(d) { return timeScale(d) - 1;} )
		.startAngle(function(d) { return -this.parentNode.__data__.maxMedals * medalDegree * Math.PI/180; })
		.endAngle(function(d) { return this.parentNode.__data__.maxMedals * medalDegree * Math.PI/180; }); 
	//Create two arcs all the way around for the first and last year
	clippedFeathers
		.selectAll(".year-outline")
		.data([1916, 1936, 1956, 1976, 1996])
		.enter().append("path")
		.attr("class", "year-outline")
		.attr("d", yearArc);

	// //Outline the feathers to make them stand out
	// feathers.append("path")
	// 	.attr("class", "feather-outline")
	// 	.attr("d", function(d) { return d.featherArc; });


});//d3.csv

////////////////////////////////////////////////////////////
///////////////////// Extra functions //////////////////////
////////////////////////////////////////////////////////////

function removeSpace(str) {
	str = str.replace(/\s+/g, '-');
	str = str.replace(/&/g, '');
	str = str.replace(/\./g,'').toLowerCase();
	return str;
}//removeSpace
