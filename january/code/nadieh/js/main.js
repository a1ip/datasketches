var isMobile = window.screen.width < 400 ? true : false;

if(isMobile) {
	d3.selectAll(".mobile").style("display", "inline-block");
	d3.selectAll(".desktop").style("display", "none");
	//d3.selectAll(".outer-margin").style("margin-left", "10px").style("margin-right", "10px");
}
//else {

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	var minWidth = 450,
		maxWidth = 1000;
	var outerWidth = Math.max(minWidth, Math.min(window.innerWidth - 30, maxWidth));
	var widthScale = d3.scaleLinear()
		.domain([450, 1000])
	    .range([60, 150]);

	var margin = {
	  top: 100,
	  right: widthScale(outerWidth),
	  bottom: 100,
	  left: widthScale(outerWidth)
	};
	var width = outerWidth - margin.left - margin.right;
	var height = 6.5*width; //Math.max(width*5,4500) - margin.top - margin.bottom;
		
	//SVG container
	var svg = d3.select('#chart')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("class", "top-wrapper")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Create extra information /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var sagaData = [
		{id: 1, subSaga: 'Raditz Saga', saga: 'Saiyan', firstEpisode: 1, lastEpisode: 7, numEpisodes: 7, firstFight: 1, lastFight: 4 },
		{id: 2, subSaga: 'Vegeta Saga', saga: 'Saiyan', firstEpisode: 7, lastEpisode: 35, numEpisodes: 29, firstFight: 5, lastFight: 25 },
		{id: 3, subSaga: 'Namek Saga', saga: 'Frieza', firstEpisode: 36, lastEpisode: 67, numEpisodes: 32, firstFight: 26, lastFight: 37 },
		{id: 4, subSaga: 'Captain Ginyu Saga', saga: 'Frieza', firstEpisode: 68, lastEpisode: 74, numEpisodes: 7, firstFight: 38, lastFight: 44 },
		{id: 5, subSaga: 'Frieza Saga', saga: 'Frieza', firstEpisode: 75, lastEpisode: 107, numEpisodes: 33, firstFight: 45, lastFight: 65 },
		//{id: 0, subSaga: 'Garlic Jr. Saga', saga: 'Cell', firstEpisode: 108, lastEpisode: 117, numEpisodes: 10 }, //filler saga
		{id: 6, subSaga: 'Trunks Saga', saga: 'Cell', firstEpisode: 118, lastEpisode: 125, numEpisodes: 8, firstFight: 66, lastFight: 72 },
		{id: 7, subSaga: 'Androids Saga', saga: 'Cell', firstEpisode: 126, lastEpisode: 139, numEpisodes: 14, firstFight: 73, lastFight: 80 },
		{id: 8, subSaga: 'Imperfect Cell Saga', saga: 'Cell', firstEpisode: 140, lastEpisode: 152, numEpisodes: 13, firstFight: 81, lastFight: 87 },
		{id: 9, subSaga: 'Perfect Cell Saga', saga: 'Cell', firstEpisode: 153, lastEpisode: 165, numEpisodes: 13, firstFight: 88, lastFight: 98 },
		{id: 10, subSaga: 'Cell Games Saga', saga: 'Cell', firstEpisode: 166, lastEpisode: 194, numEpisodes: 29, firstFight: 99, lastFight: 110 },
		//{id: 0, subSaga: 'Other World Saga', saga: 'Buu', firstEpisode: 195, lastEpisode: 199, numEpisodes: 5 }, //filler saga
		{id: 11, subSaga: 'Great Saiyaman Saga', saga: 'Buu', firstEpisode: 200, lastEpisode: 209, numEpisodes: 10, firstFight: 111, lastFight: 113 },
		{id: 12, subSaga: 'World Tournament Saga', saga: 'Buu', firstEpisode: 210, lastEpisode: 219, numEpisodes: 10, firstFight: 114, lastFight: 118 },
		{id: 13, subSaga: 'Babidi Saga', saga: 'Buu', firstEpisode: 220, lastEpisode: 231, numEpisodes: 12, firstFight: 119, lastFight: 128 },
		{id: 14, subSaga: 'Majin Buu Saga', saga: 'Buu', firstEpisode: 232, lastEpisode: 253, numEpisodes: 22, firstFight: 129, lastFight: 138 },
		{id: 15, subSaga: 'Fusion Saga', saga: 'Buu', firstEpisode: 254, lastEpisode: 275, numEpisodes: 22, firstFight: 139, lastFight: 152 },
		{id: 16, subSaga: 'Kid Buu Saga', saga: 'Buu', firstEpisode: 276, lastEpisode: 287, numEpisodes: 12, firstFight: 153, lastFight: 162 },
		{id: 17, subSaga: 'Peaceful World Saga', saga: 'Buu', firstEpisode: 288, lastEpisode: 291, numEpisodes: 4, firstFight: 163, lastFight: 166 },
	];
	var sagaNames = sagaData.map(function(d) { return d.subSaga; });
		
	var characters = [
		{character: "Goku", color: "#f27c07"}, //unique
		{character: "Vegeta", color: "#1D75AD"}, //unique
		{character: "Gohan", color: "#3e216d"}, //unique
		{character: "Krillin", color: "#FFCEB5"}, //unique
		{character: "Piccolo", color: "#56B13E"}, //unique
		{character: "Future Trunks", color: "#D8A3FA"}, //Trunks unique
		{character: "Tien Shinhan", color: "#C30703"}, //Tien & Chiaotzu
		{character: "Chiaotzu", color: "#C30703"}, //Tien & Chiaotzu
		{character: "Yamcha", color: "#ABACB9"}, //uniquw
		{character: "Goten", color: "#f2b252"}, //unique
		{character: "Trunks", color: "#D8A3FA"}, //Trunks unique
		{character: "Gotenks", color: "#6ED3C1"}, //unique
		{character: "Vegito", color: "url(#vegito-gradient)"}, //unique combined gradient of Goku & Vegeta
		{character: "Raditz", color: "#0B2D52"}, //Raditz & Nappa
		{character: "Nappa", color: "#0B2D52"}, //Raditz & Nappa
		{character: "Frieza", color: "#82307E"}, //unique
		{character: "Android 16", color: "#383838"},
		{character: "Android 17", color: "#383838"},
		{character: "Future Android 17", color: "#383838"},
		{character: "Android 18", color: "#383838"},
		{character: "Future Android 18", color: "#383838"},
		{character: "Android 19", color: "#383838"},
		{character: "Android 20", color: "#383838"},
		{character: "Cell", color: "#9DBD2A"}, //unique
		{character: "Cell Jr. 1", color: "#b5d63e"},
		{character: "Cell Jr. 2", color: "#b5d63e"},
		{character: "Cell Jr. 3", color: "#b5d63e"},
		{character: "Cell Jr. 4", color: "#b5d63e"},
		{character: "Cell Jr. 5", color: "#b5d63e"},
		{character: "Cell Jr. 6", color: "#b5d63e"},
		{character: "Cell Jr. 7", color: "#b5d63e"},
		{character: "Future Cell", color: "#9DBD2A"},
		{character: "Buu", color: "#F390A4"}, //unique
		{character: "Evil Buu", color: "#C8B4C0"},
		{character: "Good (Majin) Buu", color: "#FFBBBE"}
	];
	var names = characters.map(function(d) { return d.character; });

	//Characters to follow across sub sagas
	var fullCharacters = ["Goku","Vegeta","Gohan","Krillin","Buu","Piccolo","Cell","Frieza","Future Trunks","Gotenks"];
	//Possible extra: ["Tien Shinhan","Yamcha",,"Chiaotzu","Trunks"]

	//Special fights
	var specialFights = [
		{fightID: 4, fightSaga: "Raditz Saga", horizontalOffset: 8, hExtra: -0.3, hExtraMobile: 0.2, img_url: "Raditz_is_killed.gif", stroke: "#f27c07", fightText: "Goku sacrifices himself so Piccolo can kill Goku's evil brother Raditz", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 18, fightSaga: "Vegeta Saga", horizontalOffset: 4, hExtra: 0.75, hExtraMobile: 0.65, img_url: "Vegeta_over_9000.gif", stroke: "#1D75AD", fightText: "The most famous DBZ meme is when Vegeta measures Goku's power level (who's back from the dead) and screams in anger 'It's over 9000!'", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 19, fightSaga: "Vegeta Saga", horizontalOffset: -3.5, hExtra: 0.2, hExtraMobile: 0.95, img_url: "Goku_fights_Vegeta.gif", stroke: "#f27c07", fightText: "An epic battle ensues between Goku and Vegeta lasting several episodes", textX: -1.25, textY: 1.25, textAnchor: "start" },
		{fightID: 55, fightSaga: "Frieza Saga", horizontalOffset: 3, hExtra: 0.2, hExtraMobile: 0.8, img_url: "Goku_fights_Frieza.gif", stroke: "#82307E", fightText: "Goku and the others (although Vegeta was just killed by Frieza) try valiantly but they're no match for Frieza", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 60, fightSaga: "Frieza Saga", horizontalOffset: 5, hExtra: 0.2, hExtraMobile: 0.7, img_url: "Goku_goes_Super_Saiyan.gif", stroke: "#f27c07", fightText: "After seeing his friend Krillin get destroyed by Frieza, Goku finally loses it and magnificently turns into a Super Saiyan", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 67, fightSaga: "Trunks Saga", horizontalOffset: -4.5, hExtra: 0.2, hExtraMobile: 0.3, img_url: "Trunks_kills_Frieza.gif", stroke: "#D8A3FA", fightText: "A cybernetically enhanced Frieza comes to Earth to kill all, but is swiftly sliced in half by Future Trunks", textX: -1.25, textY: 1.25, textAnchor: "start" },
		{fightID: 69, fightSaga: "Trunks Saga", horizontalOffset: 6, hExtra: 0.6, hExtraMobile: 0, img_url: "Trunks_tests_Goku.gif", stroke: "#D8A3FA", fightText: "Trunks spars with Goku to test Goku's strength", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 104, fightSaga: "Cell Games Saga", horizontalOffset: -6, hExtra: 0.4, hExtraMobile: 0.9, img_url: "Gohan_goes_SSJ2.gif", stroke: "#3e216d", fightText: "Enraged with Cell for killing Android 16, and the Cell Juniors' beating his friends, Gohan's hidden power erupts, transforming him into a Super Saiyan 2", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 108, fightSaga: "Cell Games Saga", horizontalOffset: 2.5, hExtra: 0.4, hExtraMobile: 0.3, img_url: "Gohan_kills_Cell.gif", stroke: "#3e216d", fightText: "Releasing all the energy he has, Gohan's Father-Son Kamehameha is strong enough to vaporize every cell in Cell's body", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 128, fightSaga: "Babidi Saga", horizontalOffset: -8, hExtra: 0.8, hExtraMobile: 0.3, img_url: "Goku_fights_Majin_Vegeta.gif", stroke: "#f27c07", fightText: "After Vegeta lets Babidi control him so he could become evil again the second epic battle between Goku and (Majin) Vegeta starts", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 134, fightSaga: "Majin Buu Saga", horizontalOffset: -5, hExtra: 0.2, hExtraMobile: 0.9, img_url: "Vegeta_sacrifice.gif", stroke: "#1D75AD", fightText: "One of the best DBZ moments happens when Vegeta sacrifices himself for his family to destroy Majin Buu (which sadly doesn't work)", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 147, fightSaga: "Fusion Saga", horizontalOffset: -7, hExtra: 0.5, hExtraMobile: 0.9, img_url: "Vegito_fights_Super_Buu.gif", stroke: "url(#vegito-gradient)", fightText: "After nothing else works, Goku and Vegeta fuse to become Vegito, who dominates over Super Buu, even when turned into a jawbreaker", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 156, fightSaga: "Kid Buu Saga", horizontalOffset: -10, hExtra: -0.1, hExtraMobile: 0.3, img_url: "Goku_fights_Kid_Buu.gif", stroke: "#F390A4", fightText: "Goku unleashes his Super Saiyan 3 form to fight Kid Buu, but it's still not enough", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 162, fightSaga: "Kid Buu Saga", horizontalOffset: -7, hExtra: -0.3, hExtraMobile: 0.4, img_url: "Goku_kills_Kid_Buu.gif", stroke: "#f27c07", fightText: "After getting the energy from everybody on Earth (thanks to Mr. Satan) Goku finally kills Kid Buu with a massive Spirit Bomb", textX: -1.25, textY: -1, textAnchor: "end" },
	];

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create the scales //////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var sagaScale = d3.scaleLinear()
		.domain([1, 17])
	    .range([0, width]);

	var fightScale = d3.scaleLinear()
	    .range([0, height]);

	var colorScale = d3.scaleOrdinal()
		.domain( characters.map(function(d) { return d.character; }) )
		.range( characters.map(function(d) { return d.color; }) );

	var xSwoopScale = d3.scaleLinear()
		.domain([1, 20])
	    .range([1, 15]);

	var jitterScale = d3.scaleLinear()
		.domain([1, 15])
	    .range([0.9,0.2])
	    .clamp(true);  

	var rScale = d3.scaleLinear() //on purpose
		.domain([300,600,1200])
	    .range([3,4,8]);

	var strokeWidthScale = d3.scaleLinear()
		.domain([minWidth, maxWidth])
		.range([1.5, 4]);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create defs elements ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Add gradient on first fight
	var extraOffset = outerWidth === 1000 ? (window.innerWidth - 1000)/2 : 0;
	//d3.select("body").style("background","radial-gradient(circle closest-corner at " + Math.round(margin.left + extraOffset) + "px " + Math.round(margin.top) + "px, #fdf0db 0%, #fdf6db 100%, #FFFFFF 300%)");
	//d3.select("body").style("background","radial-gradient(circle closest-corner at " + Math.round(margin.left + extraOffset) + "px " + Math.round(margin.top) + "px, #0e4948 0%, #00081c 700%)");

	//Container for the gradients
	var defs = svg.append("defs");

	var annotationCircleSize = sagaScale(2) - sagaScale(1);
	//Create wrapper for the clip paths
	var imageWrapper = defs.append("g").attr("class", "clip-group-wrapper");

	imageWrapper.selectAll(".circle-image")
		.data(specialFights)
		.enter().append("pattern")
		.attr("id", function(d) { return "circle-image-" + d.fightID; })
		.attr("class", "circle-image")
		.attr("patternUnits","objectBoundingBox")
		.attr("height", "100%")
		.attr("width", "100%")
		.append("image")
			.attr("xlink:href", function(d) { return "img/" + (isMobile ? d.img_url.replace(".gif", ".jpg") : d.img_url); })
			.attr("x", function(d) { return isMobile ? sagaScale(d.hExtraMobile) : sagaScale(d.hExtra); })
			.attr("height", 2*annotationCircleSize);

	//Code taken from http://stackoverflow.com/questions/9630008/how-can-i-create-a-glow-around-a-rectangle-with-svg
	//Filter for the outside glow
	var filter = defs.append("filter")
	  .attr("id","glow");

	filter.append("feColorMatrix")
		.attr("type", "matrix")
		.attr("values", "0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0 0.4 0")
	filter.append("feGaussianBlur")
	  .attr("stdDeviation","3")
	  .attr("result","coloredBlur");;

	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
	  .attr("in","coloredBlur");
	feMerge.append("feMergeNode")
	  .attr("in","SourceGraphic");

	//Create a gradient for the saga lines, from transparent to grey to transparent again
	var sagaLineGradient = defs.append("linearGradient")    
		.attr("x1", 0).attr("y1", 0)         
		.attr("x2", 0).attr("y2", 1)                 
		.attr("id", "saga-line-gradient");
	sagaLineGradient.append("stop").attr("offset", "0%").attr("stop-color", "#e1e1e1").attr("stop-opacity", 0);
	sagaLineGradient.append("stop").attr("offset", "10%").attr("stop-color", "#e1e1e1");
	sagaLineGradient.append("stop").attr("offset", "90%").attr("stop-color", "#e1e1e1");
	sagaLineGradient.append("stop").attr("offset", "100%").attr("stop-color", "#e1e1e1").attr("stop-opacity", 0);

	//Create a gradient to fill the lines from the annotations circles to the fights
	var annotationLineGradient = defs.selectAll(".annotation-line-gradient")
		.data(specialFights.filter(function(d) { return d.fightID !== 147; }))
		.enter().append("linearGradient") 
		.attr("class", "annotation-line-gradient")              
		.attr("id", function(d) { return "gradient-id-" + d.fightID; })   
		.attr("x1", function(d) { return d.horizontalOffset > 0 ? 1 : 0; })
		.attr("y1", 0)         
		.attr("x2", function(d) { return d.horizontalOffset > 0 ? 0 : 1; })
		.attr("y2", 0);
	annotationLineGradient
		.append("stop")
		.attr("offset", "60%")
		.attr("stop-color", function(d) { return d.stroke; });
	annotationLineGradient
		.append("stop")
		.attr("offset", "90%")
		.attr("stop-opacity", 0)
		.attr("stop-color", function(d) { return d.stroke; });

	//Create special gradient for Vegito annotation line
	var vegitoLineGradient = defs.append("linearGradient")
		.attr("class", "annotation-line-gradient")              
		.attr("id",  "gradient-id-147")   
		.attr("x1", 0).attr("y1", 0)         
		.attr("x2", 1).attr("y2", 0);
	vegitoLineGradient
		.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", "#1D75AD");
	vegitoLineGradient
		.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", "#f27c07");
	vegitoLineGradient
		.append("stop")
		.attr("offset", "90%")
		.attr("stop-opacity", 0)
		.attr("stop-color", "#f27c07");

	//Create a gradient for the fused Goku and Vegeta
	var vegitoGradient = defs.append("linearGradient")    
		.attr("x1", 0).attr("y1", 0)         
		.attr("x2", 1).attr("y2", 0)                 
		.attr("id", "vegito-gradient");
	vegitoGradient.append("stop").attr("offset", "50%").attr("stop-color", "#f27c07");
	vegitoGradient.append("stop").attr("offset", "50%").attr("stop-color", "#1D75AD");


	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Read in the data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	d3.csv('../../data/nadieh/dragonball_Z_fight_per_person.csv', function (error, data) {

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Final data prep /////////////////////////////
		///////////////////////////////////////////////////////////////////////////
		
		if (error) throw error;
		
		data.forEach(function(d) {
			d.id = +d.id;
		});

		//Set the first and final fight id
		fightScale.domain( d3.extent(data, function(d) { return d.id; }) );

		//Pre-calculate the x and y location of the fight annotations
		specialFights.forEach(function(d) {
			d.x = Math.round(sagaScale( sagaData[sagaNames.indexOf(d.fightSaga)].id + d.horizontalOffset));
			d.y = fightScale(d.fightID) - annotationCircleSize;
		});

		//Nest the data on saga and then on fight
		var fightNestedData = d3.nest()
			.key(function(d) { return d.id; })
			.entries(data);

		//Nest the data on character then by subsaga
		var characterNestedData = d3.nest()
			.key(function(d) { return d.name; })
			.key(function(d) { return d.subSaga; })
			.entries(data);

		var baseRadius = rScale(width); //The default radius of the character circles
		var baseDistanceRatio = 0.7; //The default distance that the circles are apart
		var backgroundRectSize = height / (fightScale.domain()[1] - fightScale.domain()[0]); //The default size of the background rectangle

		var xSwoopDist = (sagaScale(2) - sagaScale(1))/2;

		///////////////////////////////////////////////////////////////////////////
		////////////////////////// Create a line per saga /////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var sagaLine = svg.append("g").attr("class","saga-line-wrapper");

		//Add a vertical line per saga
		sagaLine.selectAll(".saga-line")
			.data(sagaData)
			.enter().append("line")
			.attr("class", "saga-line")
			.attr("x1", function(d,i) { return Math.round(sagaScale( i+1 )); })
			.attr("y1", function(d) { return fightScale(d.firstFight - 1.5); })
			.attr("x2", function(d,i) { return Math.round(sagaScale( i+1 ))+0.01; })
			.attr("y2", function(d) { return fightScale(d.lastFight + 1.5); })
			.style("stroke", "url(#saga-line-gradient)");

		if(isMobile) d3.selectAll(".saga-line").style("stroke-width", 0.5);

		///////////////////////////////////////////////////////////////////////////
		//////////////////////// Create the character paths ///////////////////////
		///////////////////////////////////////////////////////////////////////////

		var characterLineWrapper = svg.append("g").attr("class", "character-line-wrapper");

		var characterLines = characterLineWrapper.selectAll(".character-path-group")
			.data(characterNestedData)
			.enter().append("g")
			.attr("class", function(d) { return "character-path-group " + d.key.replace(" ", "_").toLowerCase(); })
			.style("opacity", function(d) { return d.key === "Goku" ? 1 : 0.4; })
			.each(function(d,k) {

				//if(k > 0) return;

				var el = d3.select(this);
				var sagaFights = d.values;
				var fullChar = fullCharacters.indexOf(d.key) > -1;

				//To what side of the saga line should the line swoop (-1 left, 1 right)
				var xSwing = Math.random() > 0.5 ? 1 : -1;
				var jitter = 0, maxJitter, minJitter, jitterUp = 0,
					yDiff,
					xOld, yOld,
					xBaseline;
				var path,
					pathUp;

				sagaFights.forEach(function(s,i) {
					var charFights = s.values;

					if(!fullChar && charFights.length === 1) return;
					//if(i === 11) debugger;

					var j = 0;
					var x = Math.round(sagaScale( sagaData[sagaNames.indexOf(charFights[j].subSaga)].id )),
						y = fightScale(charFights[j].id);

					//For the characters that have a line crossing the different sagas
					if(fullChar && i > 0) { 
						yDiff = y - yOld;
						xDiff = x - xOld;
						xBaseline = xSwing === 1 ? x : xOld;
						numFightsInBetween = yDiff/backgroundRectSize;
						maxJitter = 1 + jitterScale(numFightsInBetween);
						minJitter = 1 - jitterScale(numFightsInBetween)/2;
						jitter = (Math.random() * (maxJitter - minJitter) + minJitter).toFixed(2);
						jitterUp = jitter - 0.01;
						while(Math.abs(jitterUp - jitter) < 0.1) {
							jitterUp = (Math.random() * (maxJitter - minJitter) + minJitter).toFixed(2);
						}//while

						path = path + " Q" + round2(xSwing*xSwoopScale(numFightsInBetween)*xSwoopDist*jitter + xBaseline) + "," + round2(yDiff/2 + yOld)  + " " + x + "," + round2(y);
						
						//If this is the end of the path, don't attach the current x and y, only the Q
						if(charFights.length === 1 && i === sagaFights.length-1) {
							pathUp = " Q" + round2(xSwing*xSwoopScale(numFightsInBetween)*xSwoopDist*jitterUp + xBaseline) + "," + round2(yDiff/2 + yOld) + " " + pathUp;
						} else {
							pathUp = x + "," + round2(y) + " Q" + round2(xSwing*xSwoopScale(numFightsInBetween)*xSwoopDist*jitterUp + xBaseline) + "," + round2(yDiff/2 + yOld) + " " + pathUp;
						}//else
						
						xSwing = xSwing * -1;
					 } else { 
					 	path = "M" + x + "," + round2(y); 
					 	pathUp = x + "," + round2(y) + " Z";
					 }//else

					xOld = x;
					yOld = y;

					for(var j=1; j<charFights.length; j++) {
						x = Math.round(sagaScale( sagaData[sagaNames.indexOf(charFights[j].subSaga)].id ));
						y = fightScale(charFights[j].id);
						yDiff = y - yOld;
						numFightsInBetween = yDiff/backgroundRectSize;
						maxJitter = 1 + jitterScale(numFightsInBetween);
						minJitter = 1 - jitterScale(numFightsInBetween)/2;
						jitter = (Math.random() * (maxJitter - minJitter) + minJitter).toFixed(2);
						jitterUp = jitter - 0.01;
						while(Math.abs(jitterUp - jitter) < 0.1) {
							jitterUp = (Math.random() * (maxJitter - minJitter) + minJitter).toFixed(2);
						}//while

						//Lots of stuff happening to get some randomness to the lines, so people from the same fight hopefully don't overlap too much
						path = path + " Q" + round2(xSwing*xSwoopScale(numFightsInBetween)*xSwoopDist*jitter + x) + "," + round2(yDiff/2 + yOld) + " " + x + "," + round2(y);
						
						//If this is the end of the path, don't attach the current x and y, only the Q
						if( (!fullChar && j === charFights.length-1) || (fullChar && j === charFights.length-1 && i === sagaFights.length-1) ) {
							pathUp = " Q" + round2(xSwing*xSwoopScale(numFightsInBetween)*xSwoopDist*jitterUp + x) + "," + round2(yDiff/2 + yOld) + " " + pathUp;
						} else {
							pathUp = x + "," + round2(y) + " Q" + round2(xSwing*xSwoopScale(numFightsInBetween)*xSwoopDist*jitterUp + x) + "," + round2(yDiff/2 + yOld) + " " + pathUp;
						}

						xOld = x;
						yOld = y;

						//Move the Q to the other side (with respect to the fight location)
						xSwing = xSwing * -1;
					}//for j

					if(!fullChar || (fullChar && i === sagaFights.length-1)) {
						el.append("path")
							.attr("class","character-path")
							.attr("d", path + pathUp);						
					}//if

				});

			})
			.style("stroke", function(d,i) {
				var loc = names.indexOf(d.key);
				d.charColor = loc > -1 ? characters[loc].color === "#" ? "#515151" : characters[loc].color : "#c1c1c1";
				return d.charColor;
			})
			.style("stroke-width", function(d) { return 1; })
			.style("fill", function(d,i) { return d.charColor; })
			//.style("filter", function(d) { return d.key === "Goku" ? "url(#glow)" : "none"; })
			.on("mouseover", function(d) {

				//Make the hovered line more visible and rest less
				characterLines
					.transition("fade").duration(300)
					.style("opacity", 0.05);
				d3.select(this)
					.transition("fade").duration(300)
					.style("opacity", 0.8);

				//Hide saga lines & annotation a bit
				sagaLine
					.transition("visible").duration(300)
		        	.style("opacity", 0.3);
		        annotationWrapper
					.transition("visible").duration(300)
		        	.style("opacity", 0.1);
		    	sagaTextWrapper
		        	.transition("visible").duration(300)
		        	.style("opacity", 0.3);

				//Hide all the battles that do not feature the hovered over person
				fights.filter(function(c) { return c.values.map(function(f) { return f.name; }).indexOf(d.key) === -1; })
					.transition("fade").duration(300)
					.style("opacity", 0.1);

				//Move the line tooltip to the right location
		  		tooltipCharacterLine.text(d.key);
		      	tooltipWrapperLine
		      		.transition("move").duration(200)
		        	.attr("transform", "translate(" + (d3.event.offsetX - margin.left) + "," + (d3.event.offsetY - margin.top - 20) + ")")
		        	.style("opacity", 1);

			})
			.on("mousemove", function(d) {
				//Move the line tooltip to the right location
		  		tooltipCharacterLine.text(d.key);
		      	tooltipWrapperLine
		      		.transition("move").duration(200)
		        	.attr("transform", "translate(" + (d3.event.offsetX - margin.left) + "," + (d3.event.offsetY - margin.top - 20) + ")")
		        	.style("opacity", 1);
			})
			.on("mouseout", function(d) {

				//Hovered lines back to default
				characterLines
					.transition("fade").duration(300)
					.style("opacity", 0.4);

				//Fights back to default
				fights
					.transition("fade").duration(300)
					.style("opacity", 1);

				//Hide the tooltip
				tooltipWrapperLine
					.transition().duration(200)
					.style("opacity", 0);

				//Reveal saga lines & annotations
				sagaLine
					.transition("visible").duration(300)
		        	.style("opacity", 1);
		        annotationWrapper
					.transition("visible").duration(300)
		        	.style("opacity", 1);
		        sagaTextWrapper
		        	.transition("visible").duration(300)
		        	.style("opacity", 1);

			});

		///////////////////////////////////////////////////////////////////////////
		//////////////////// Add extra fights and annotations /////////////////////
		///////////////////////////////////////////////////////////////////////////

		var annotationWrapper = svg.append("g").attr("class", "annotation-wrapper");

		//Create a group for each annotation
		var annotations = annotationWrapper.selectAll(".annotation-group")
			.data(specialFights)
			.enter().append("g")
			.attr("class", "annotation-group")
			.attr("transform", function(d) { return "translate(" + (d.x + annotationCircleSize) + "," + (d.y + annotationCircleSize) + ")"; });

		//Add lines from about the fight to the circle
		annotations.append("line")
			.attr("class", "annotation-line")
			.attr("x1", function(d) { return 0; })
			.attr("y1", function(d) { return 0; })
			.attr("x2", function(d) { 
				var extra = d.horizontalOffset > 0 ? 1.5 : 2.5;
				return -1 * Math.round(sagaScale(d.horizontalOffset + 2)); 
			})
			.attr("y2", function(d) { return 0.01; })
			//.style("stroke", function(d) { return d.stroke; })
			.style("stroke", function(d) { return "url(#gradient-id-" + d.fightID + ")"; })
			.style("stroke-width", strokeWidthScale(width) );

		//Add the circles that will be filled with images
		annotations.append("circle")
			.style("fill", function(d) { return "url(#circle-image-" + d.fightID + ")"; })
			.attr("r", annotationCircleSize)
			.style("stroke", function(d) { return d.stroke; })
			.style("stroke-width", strokeWidthScale(width) );

		//Add the text to the images
		annotations.append("text")
			.attr("class", "annotation-text")
			.attr("x", function(d) { return d.textX * annotationCircleSize; })
			.attr("y", function(d) { return d.textY * annotationCircleSize; })
			.attr("dy", "0.75em")
			.style("text-anchor", function(d) { return d.textAnchor; })
			.style("fill", function(d) { return d.stroke; })
			.text(function(d) { return d.fightText; })
			.call(wrap, annotationCircleSize*3);

		///////////////////////////////////////////////////////////////////////////
		/////////////////////// Create the text for each saga /////////////////////
		///////////////////////////////////////////////////////////////////////////

		var sagaTextWrapper = svg.append("g").attr("class","saga-text-wrapper");

		//Add the name of the saga
		var sagaText = sagaTextWrapper.selectAll(".saga-name-group")
			.data(sagaData)
			.enter().append("g")
			.attr("class", "saga-name-group")
			.attr("transform", function(d,i) {
				var x = sagaScale(i+1) + 3*xSwoopDist*(i <= 9 ? 1 : -1),
					y = fightScale(d.firstFight);
				return "translate(" + x + "," + y + ")";

			})
			.style("text-anchor", function(d,i) { return i <= 9 ? "start" : "end"; });

		sagaText.append("text")
			.attr("class", "subsaga-name")
			.text(function(d) { return d.subSaga; });

		sagaText.append("text")
			.attr("class", "saga-name")
			.attr("y", "1.6em")
			.text(function(d) { return "part of the " + d.saga + " saga"; });

		sagaText.append("text")
			.attr("class", "saga-episode")
			.attr("y", "3.3em")
			.text(function(d) { return "episodes " + d.firstEpisode + " - " + d.lastEpisode; });

		///////////////////////////////////////////////////////////////////////////
		///////////////////////// Create a group per fight ////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var fightOuterWrapper = svg.append("g").attr("class", "fight-outer-wrapper");

		//Outer wrapper that will stay in place
		var fightWrapper = fightOuterWrapper.selectAll(".fight-wrapper")
			.data(fightNestedData, function(d) { return d.key; })
			.enter().append("g")
			.attr("class","fight-wrapper")
			.attr("transform", function(d) { 
				d.x = Math.round(sagaScale( sagaData[sagaNames.indexOf(d.values[0].subSaga)].id ));
				d.y = fightScale(+d.key);
				return "translate(" + d.x + "," + d.y + ")"; 
			});

		//Inner fight wrapper that can be scaled on hover
		var fights = fightWrapper.append("g")
			.attr("class","fight")
			.style("isolation", "isolate")
			.each(function(d) {
				d.numFighters = d.values.length;
				if( /Vegito/.test(d.values[0].state) ) d.numFighters -=1;
			})
			.on("mouseover", function(d) {
				var el = d3.select(this);

				//Move the parent group to the front
				d3.select(this.parentNode).moveToFront();
				//this.parentNode.appendChild(this); //doesn't work

				// //Insert a rectangle that will overlay everything but the fight
				// d3.select(this).insert("rect", ":first-child")
				// 	.attr("id","overlay-rect")
				// 	.attr("x", -d.x)
				// 	.attr("y", -d.y)
				// 	.attr("width", width)
				// 	.attr("height", height)
				// 	.style("opacity", 0)
				// 	.transition("visible").duration(500)
				// 	.style("opacity", 0.6);

				//Make the fight elements bigger
				el
					.transition("grow").duration(500)
					.attr("transform", "scale(3)");

				//Move the circles apart
				el.selectAll(".character-circle-group")
					.transition("move").duration(700)
					.attr("transform", function(c,i) { 
						var x = baseRadius*3 * Math.cos( i * Math.PI * 2 / d.numFighters ),
							y = baseRadius*3 * Math.sin( i * Math.PI * 2 / d.numFighters );
						return "translate(" + x + "," + y + ")"; 
					});

				//Make the background rect smaller
				el.select(".fight-background")
					.transition().duration(500)
					.attr("y", -backgroundRectSize/2/3)
					.attr("height", backgroundRectSize/3);

				//Make the background circle visible
				el.select(".fight-background-circle")
					.style("filter", "url(#glow)")
					.transition().duration(500)
					.style("opacity", 1);

				//Make all the character lines less visible, except for those in the fight
				characterLines
					.transition("fade").duration(300)
					.style("opacity", function(c) {
						if( d.values.map(function(f) { return f.name; }).indexOf(c.key) === -1 ) {
							return 0.05;
						} else {
							return 1;
						}//else
					});

				// //Hide all the battles that do not feature the hovered over person
				// fights.filter(function(c) { return c.values.map(function(f) { return f.name; }).indexOf(d.name) === -1; })
				// 	.transition("fade").duration(300)
				// 	.style("opacity", 0.1);

				//Hide saga lines & annotation a bit
				sagaLine
					.transition("visible").duration(300)
		        	.style("opacity", 0.3);
		        annotationWrapper
					.transition("visible").duration(300)
		        	.style("opacity", 0.1);
		        sagaTextWrapper
		        	.transition("visible").duration(300)
		        	.style("opacity", 0.3);

				//Names of the fighters involved
				console.log(d.key, d.values.map(function(c) { return c.name; }));

			})
			.on("mouseout", function(d) {
				var el = d3.select(this);

				// //Remove overlay rect that hid the rest except for the fight
				// el.select("#overlay-rect")
				// 	.transition("visible").duration(500)
				// 	.style("opacity", 0)
				// 	.remove();

				//Return to the normal scale
				el
					.transition("grow").duration(500)
					.attr("transform", "scale(1)");

				//Move circles back together
				el.selectAll(".character-circle-group")
					.transition("move").duration(500)
					.attr("transform", function(c,i) { 
						var x = baseRadius*baseDistanceRatio * Math.cos( i * Math.PI * 2 / d.numFighters ),
							y = baseRadius*baseDistanceRatio * Math.sin( i * Math.PI * 2 / d.numFighters );
						return "translate(" + x + "," + y + ")"; 
					});

				//Make the background rect normal
				el.select(".fight-background")
					.transition().duration(500)
					.attr("y", -backgroundRectSize/2)
					.attr("height", backgroundRectSize);

				//Hide the background circle
				el.select(".fight-background-circle")
					.transition().duration(500)
					.style("opacity", 0)
					.on("end", function() { d3.select(this).style("filter", null); })

				//Turn all character lines normal
				characterLines
					.transition("fade").duration(300)
					.style("opacity", 0.4);


				//Reveal saga lines & annotations
				sagaLine
					.transition("visible").duration(300)
		        	.style("opacity", 1);
		        annotationWrapper
					.transition("visible").duration(300)
		        	.style("opacity", 1);
		        sagaTextWrapper
		        	.transition("visible").duration(300)
		        	.style("opacity", 1);

			});

		///////////////////////////////////////////////////////////////////////////
		//////////////////// Create the circles per character /////////////////////
		///////////////////////////////////////////////////////////////////////////

		//Add an invisible background to capture the mouse events
		var fightBackground = fights.append("rect")
			.attr("class", "fight-background")
			.attr("x", -backgroundRectSize/2)
			.attr("y", -backgroundRectSize/2)
			.attr("width", backgroundRectSize)
			.attr("height", backgroundRectSize);

		//Extra background that becomes visible on hover
		var fightCircleBackground = fights.append("circle")
			.attr("class", "fight-background-circle")
			.attr("r", baseRadius*7)
			.style("opacity", 0);

		//Create circles along the saga lines
		var fightCharacter = fights.selectAll(".character-circle-group")
			.data(function(d) { return d.values; })
			.enter().append("g")
			.attr("class","character-circle-group")
			.attr("transform", function(d,i) { 
				var x = baseRadius*baseDistanceRatio * Math.cos( i * Math.PI * 2 / this.parentNode.__data__.numFighters ),
					y = baseRadius*baseDistanceRatio * Math.sin( i * Math.PI * 2 / this.parentNode.__data__.numFighters );
				return "translate(" + x + "," + y + ")"; 
			})
			.each(function(d,i) {

				var el = d3.select(this);

				//Check for fused Vegito
				var isVegito = /Vegito/.test(d.state);
				//Move to the next if this is the last person in the Vegito fight (which is Vegeta, but he is already represented by Goku)
				if(isVegito && i >= this.parentNode.__data__.numFighters) return;

				//If the state contains Vegito, use Vegito's color
				var name = isVegito ? "Vegito" : d.name;
				var loc = names.indexOf(name);
				var charColor = loc > -1 ? characters[loc].color : "#c1c1c1";

				el.append("circle")
					.attr("class", "character-circle")
					.attr("r", baseRadius)
					.style("fill", charColor);

				//Add extra elements depending on the state of the character
				if(d.state === "Super Saiyan" || d.state === "Vegito Super Saiyan" || d.state === "Second Form" || d.state === "Semi-Perfect Form" || d.state === "Super") {
					firstPower(el, charColor, 1.5, 1);
				} else if(d.state === "2nd Grade Super Saiyan") {
					firstPower(el, charColor, 1.5, 1.5);
				} else if(d.state === "3rd Grade Super Saiyan") {
					firstPower(el, charColor, 1.6, 2);
				} else if(d.state === "Full-Power Super Saiyan") {
					firstPower(el, charColor, 1.75, 2.5);
				} else if(d.state === "Super Saiyan 2" || d.state === "Third Form" || d.state === "Perfect Form" || d.state === "Kid") {
					firstPower(el, charColor, 1.5, 1);
					secondPower(el, charColor, 2, 1);
				} else if(d.state === "Majin Super Saiyan 2") { //Vegeta
					firstPower(el, charColor, 1.5, 1);
					secondPower(el, charColor, 2, 1);
					el.append("text")
						.attr("class", "majin-text")
						.attr("dy","0.35em")
						.text("M");
				} else if(d.state === "Perfect and Power-weighted Form") { //Cell
					firstPower(el, charColor, 1.5, 1);
					secondPower(el, charColor, 2.1, 1.5);
				} else if(d.state === "Super Saiyan 3" || d.state === "Final Form" || d.state === "Super Perfect Form" ) {
					firstPower(el, charColor, 1.5, 1);
					secondPower(el, charColor, 2, 1);
					thirdPower(el, charColor);
				} else if(d.state === "Mecha") { //Frieza vs Future Trunks
					firstPower(el, "#cccccc", 1.5, 1);
					secondPower(el, "#cccccc", 2, 1);
					thirdPower(el, "#cccccc");
				} else if(d.state === "Goku's body") { //By Captain Ginyu
					firstPower(el, "#f27c07", 1.5, 1); 
				} else if(d.state === "Great Ape") { //Gohan and Vegeta
					firstPower(el, "#361607", 1.5, 1); 
				} else if(d.state === "Great Saiyaman") { //Gohan
					firstPower(el, "#6DD903", 1.5, 1); 
				} else if(d.state === "Vegito Candy") { //Vegito
					firstPower(el, "#39100A", 1.5, 1); 
				} else if(d.state === "Mighty Mask") { //Goten & Trunks
					firstPower(el, "#005758", 1.5, 1); 
				}//else if

			});


		//Functions to add extra stroked circles around the character circle
		//depending on their power level
		function firstPower(el, charColor, radiusRatio, strokeWidth) {
			el.append("circle")
				.attr("class", "character-circle")
				.attr("r", baseRadius * radiusRatio)
				.style("fill", "none")
				.style("stroke", charColor)
				.style("stroke-width", strokeWidth);
		}//firstPower

		function secondPower(el, charColor, radiusRatio, strokeWidth) {
			el.append("circle")
				.attr("class", "character-circle")
				.attr("r", baseRadius * radiusRatio)
				.style("fill", "none")
				.style("stroke", charColor)
				.style("stroke-width", strokeWidth);
		}//secondPower

		function thirdPower(el, charColor) {
			el.append("circle")
				.attr("class", "character-circle")
				.attr("r", baseRadius * 2.5)
				.style("fill", "none")
				.style("stroke", charColor)
				.style("stroke-width", 1);
		}//thirdPower

		///////////////////////////////////////////////////////////////////////////
		////////////////////////////// Add Tooltip ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		//A very simple tooltip that shows when you hover over a character line
		var tooltipWrapperLine = svg.append("g")
		  .attr("class", "tooltip-wrapper-line")
		  .attr("transform", "translate(" + 0 + "," + 0 + ")")
		  .style("opacity", 0);

		var tooltipCharacterLine = tooltipWrapperLine.append("text")
		  .attr("class", "tooltip-character-line")
		  .text("");



	});//d3.csv

//}//else

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Extra functions ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Round number to 2 behind the decimal
function round2(num) {
	return (Math.round(num * 100)/100).toFixed(2);
}//round2

//Bring the mousovered fight to the front
//http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};	
// d3.selection.prototype.moveToBack = function() { 
//     return this.each(function() { 
//         var firstChild = this.parentNode.firstChild; 
//         if (firstChild) { 
//             this.parentNode.insertBefore(this, firstChild); 
//         } 
//     }); 
// };

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
  text.each(function() {
	var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.2, // ems
		y = parseFloat(text.attr("y")),
		x = parseFloat(text.attr("x")),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

	while (word = words.pop()) {
	  line.push(word);
	  tspan.text(line.join(" "));
	  if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	  }
	}
  });
}//wrap

