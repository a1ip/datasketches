////////////////////////////////////////////////////////////
///////////////////// Read in data /////////////////////////
////////////////////////////////////////////////////////////
		
d3.csv('../../data/nadieh/olympic_sports_other.csv', function (error, data) {

	if (error) throw error;
	
	//Size
	var margin = {top: 40, right: 20, left: 120, bottom: 40},
		width = 350 - margin.left - margin.right,
	    height = 250 - margin.top - margin.bottom;
		
	////////////////////////////////////////////////////////////
	////////////////////// Create SVG //////////////////////////
	////////////////////////////////////////////////////////////
				
	var svg = d3.select("#olympic-other-sports-chart").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    var timeLocation = d3.scaleBand()
    	.domain([1900, 1904, 1908, 1920])
    	.range([0, width]);

    var sportLocation = d3.scaleBand()
    	.domain(data.map(function(d) { return d.discipline; }))
    	.range([0, height])
    	.padding(0.4);

    var medalWidth = 8;

	////////////////////////////////////////////////////////////
	/////////////////// Create the bar chart ///////////////////
	////////////////////////////////////////////////////////////

	//Create a group for each disciplone
	var disciplines = svg.selectAll(".discipline-other")
		.data(data)
		.enter().append("rect")
		.attr("class", "discipline-other")
		.attr("width", function(d) { return medalWidth * d.value; })
		.attr("height", sportLocation.bandwidth() )
		.attr("x", function(d) { return timeLocation(d.edition); })
		.attr("y", function(d) { return sportLocation(d.discipline); })
		.style("fill", function(d) { return color(d.continent); });

	////////////////////////////////////////////////////////////
	////////////////////// Create the axes /////////////////////
	////////////////////////////////////////////////////////////

	//The discipline titles to the left
	svg.selectAll(".discipline-other-label")
		.data(sportLocation.domain())
		.enter().append("text")
		.attr("class", "discipline-other-label")
		.attr("x", -15)
		.attr("y", function(d) { return sportLocation(d); })
		.attr("dy", "0.7em")
		.text(function(d) { return d; });

	//The edition titles on top
	svg.selectAll(".edition-other-label")
		.data(timeLocation.domain())
		.enter().append("text")
		.attr("class", "edition-other-label")
		.attr("x", function(d) { return timeLocation(d); })
		.attr("y", height + sportLocation.bandwidth() + 3 )
		.text(function(d) { return d; });

	////////////////////////////////////////////////////////////
	///////////////////////// Add legend ///////////////////////
	////////////////////////////////////////////////////////////

	svg.append("text")
		.attr("class", "other-sports-title")
		.attr("x", -margin.left)
		.attr("y", -10)
		.text("Number of medals won");

	var legend = svg.append("g")
		.attr("class", "other-sports-legend")
		.attr("transform", "translate(" + 0 + "," + (height + 25) + ")");

	legend.append("text")
		.attr("class", "other-sports-legend-text")
		.attr("x", -15)
		.attr("y", sportLocation.bandwidth())
		.attr("dy", -0.5)
		.text("Width of 1 medal: ");

	legend.append("rect")
		.attr("class", "other-sports-legend-rect")
		.attr("width", medalWidth)
		.attr("height", sportLocation.bandwidth() )
		.attr("x", 0)
		.attr("y", 0);

});//d3.csv
