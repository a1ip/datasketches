var isMobile = window.screen.width < 400 ? true : false;

if(isMobile) {
	d3.selectAll(".mobile").style("display", "inline-block");
	d3.selectAll(".desktop").style("display", "none");
}
//else {
	
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	var outerWidth = Math.max(450, Math.min(window.innerWidth - 30,1000));
	var widthScale = d3.scaleLinear()
		.domain([450, 1000])
	    .range([60, 150]);

	var margin = {
	  top: 50,
	  right: widthScale(outerWidth),
	  bottom: 50,
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
		{id: 1, subSaga: 'Raditz Saga', saga: 'Saiyan', firstEpisode: 1, lastEpisode: 7, numEpisodes: 7 },
		{id: 2, subSaga: 'Vegeta Saga', saga: 'Saiyan', firstEpisode: 7, lastEpisode: 35, numEpisodes: 29 },
		{id: 3, subSaga: 'Namek Saga', saga: 'Frieza', firstEpisode: 36, lastEpisode: 67, numEpisodes: 32 },
		{id: 4, subSaga: 'Captain Ginyu Saga', saga: 'Frieza', firstEpisode: 68, lastEpisode: 74, numEpisodes: 7 },
		{id: 5, subSaga: 'Frieza Saga', saga: 'Frieza', firstEpisode: 75, lastEpisode: 107, numEpisodes: 33 },
		//{id: 0, subSaga: 'Garlic Jr. Saga', saga: 'Cell', firstEpisode: 108, lastEpisode: 117, numEpisodes: 10 }, //filler saga
		{id: 6, subSaga: 'Trunks Saga', saga: 'Cell', firstEpisode: 118, lastEpisode: 125, numEpisodes: 8 },
		{id: 7, subSaga: 'Androids Saga', saga: 'Cell', firstEpisode: 126, lastEpisode: 139, numEpisodes: 14 },
		{id: 8, subSaga: 'Imperfect Cell Saga', saga: 'Cell', firstEpisode: 140, lastEpisode: 152, numEpisodes: 13 },
		{id: 9, subSaga: 'Perfect Cell Saga', saga: 'Cell', firstEpisode: 153, lastEpisode: 165, numEpisodes: 13 },
		{id: 10, subSaga: 'Cell Games Saga', saga: 'Cell', firstEpisode: 166, lastEpisode: 194, numEpisodes: 29 },
		//{id: 0, subSaga: 'Other World Saga', saga: 'Buu', firstEpisode: 195, lastEpisode: 199, numEpisodes: 5 }, //filler saga
		{id: 11, subSaga: 'Great Saiyaman Saga', saga: 'Buu', firstEpisode: 200, lastEpisode: 209, numEpisodes: 10 },
		{id: 12, subSaga: 'World Tournament Saga', saga: 'Buu', firstEpisode: 210, lastEpisode: 219, numEpisodes: 10 },
		{id: 13, subSaga: 'Babidi Saga', saga: 'Buu', firstEpisode: 220, lastEpisode: 231, numEpisodes: 12 },
		{id: 14, subSaga: 'Majin Buu Saga', saga: 'Buu', firstEpisode: 232, lastEpisode: 253, numEpisodes: 22 },
		{id: 15, subSaga: 'Fusion Saga', saga: 'Buu', firstEpisode: 254, lastEpisode: 275, numEpisodes: 22 },
		{id: 16, subSaga: 'Kid Buu Saga', saga: 'Buu', firstEpisode: 276, lastEpisode: 287, numEpisodes: 12 },
		{id: 17, subSaga: 'Peaceful World Saga', saga: 'Buu', firstEpisode: 288, lastEpisode: 291, numEpisodes: 4 },
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
		{character: "Vegito", color: "#"},
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

		//Nest the data on saga and then on fight
		var sagaNestedData = d3.nest()
			.key(function(d) { return d.subSaga; })
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
		///////////////////////// Create a line per saga /////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var sagaLine = svg.append("g")
			.attr("class","saga-line-wrapper");

		//Add a vertical line per saga
		sagaLine.selectAll(".saga-line")
			.data(sagaNames)
			.enter().append("line")
			.attr("class", "saga-line")
			.attr("x1", function(d,i) { return Math.round(sagaScale( i+1 )); })
			.attr("y1", 0)
			.attr("x2", function(d,i) { return Math.round(sagaScale( i+1 )); })
			.attr("y2", height);

		//Add the name of the saga
		var sagaText = sagaLine.selectAll(".saga-name-wrapper")
			.data(sagaData)
			.enter().append("g")
			.attr("class", "saga-name-wrapper")
			.attr("transform", function(d,i) {
				var x = sagaScale(i+1) + 6*xSwoopDist*(i <= 9 ? 1 : -1),
					y = fightScale(+sagaNestedData[i].values[0].key);
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
		//////////////////////// Create the character paths ///////////////////////
		///////////////////////////////////////////////////////////////////////////

		var characterLineWrapper = svg.append("g").attr("class", "character-line-wrapper");

		var characterLines = characterLineWrapper.selectAll(".character-path-group")
			.data(characterNestedData)
			.enter().append("g")
			.attr("class", function(d) { return "character-path-group " + d.key.replace(" ", "_").toLowerCase(); })
			.each(function(d,k) {

				//if(k > 0) return;

				var el = d3.select(this);
				var sagaFights = d.values;
				var fullChar = fullCharacters.indexOf(d.key) > -1;
				//console.log(fullChar);

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
			.on("mouseover", function(d) {

				//Make the hovered line more visible and rest less
				characterLines
					.transition("fade").duration(300)
					.style("opacity", 0.2);
				d3.select(this)
					.transition("fade").duration(300)
					.style("opacity", 0.8);

				//Hide all the battles that do not feature the hovered over person
				fights.filter(function(c) { 
						return c.values.map(function(f) { return f.name; }).indexOf(d.key) === -1;
					})
					.transition("fade").duration(300)
					.style("opacity", 0.3);

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

			});

		///////////////////////////////////////////////////////////////////////////
		///////////////////////// Create a group per saga /////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var sagas = svg.selectAll(".saga")
			.data(sagaNestedData)
			.enter().append("g")
			.attr("class", "saga");

		///////////////////////////////////////////////////////////////////////////
		///////////////////////// Create a group per fight ////////////////////////
		///////////////////////////////////////////////////////////////////////////

		//Outer wrapper that will stay in place
		var fightWrapper = sagas.selectAll(".fight-wrapper")
			.data(function(d) { return d.values; })
			.enter().append("g")
			.attr("class","fight-wrapper")
			.attr("transform", function(d) { 
				var x = Math.round(sagaScale( sagaData[sagaNames.indexOf(this.parentNode.__data__.key)].id )),
					y = fightScale(+d.key);
				return "translate(" + x + "," + y + ")"; 
			});

		//Inner fight wrapper that can be scaled on hover
		var fights = fightWrapper.append("g")
			.attr("class","fight")
			.style("isolation", "isolate")
			.each(function(d) {
				d.numFighters = d.values.length;
			})
			.on("mouseover", function(d) {
				var el = d3.select(this);

				//Move the parent group to the front
				d3.select(this.parentNode).moveToFront();

				//Make the fight elements bigger
				el
					.transition("grow").duration(500)
					.attr("transform", "scale(3)");

				//Move the circles apart
				el.selectAll(".character-circle-group")
					.transition("move").duration(700)
					.attr("transform", function(c,i) { 
						var x = baseRadius*2 * Math.cos( i * Math.PI * 2 / d.numFighters ),
							y = baseRadius*2 * Math.sin( i * Math.PI * 2 / d.numFighters );
						return "translate(" + x + "," + y + ")"; 
					});

				//Make the background rect smaller
				el.select(".fight-background")
					.transition().duration(500)
					.attr("y", -backgroundRectSize/2/3)
					.attr("height", backgroundRectSize/3);

				//Make the background circle visible
				el.select(".fight-background-circle")
					.transition().duration(500)
					.style("opacity", 0.7);

				//Make all the character lines less visible, except for those in the fight
				characterLines
					.transition("fade").duration(300)
					.style("opacity", function(c) {
						if( d.values.map(function(f) { return f.name; }).indexOf(c.key) === -1 ) {
							return 0.1;
						} else {
							return 0.9;
						}//else
					});

				//Names of the fighters involved
				console.log(d.values.map(function(c) { return c.name; }));

			})
			.on("mouseout", function(d) {
				var el = d3.select(this);

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
					.style("opacity", 0);

				//Turn all character lines normal
				characterLines
					.transition("fade").duration(300)
					.style("opacity", 0.4);
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
			.attr("r", baseRadius*4.5)
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

				var loc = names.indexOf(d.name);
				var charColor = loc > -1 ? characters[loc].color === "#" ? "#515151" : characters[loc].color : "#c1c1c1";

				el.append("circle")
					.attr("class", "character-circle")
					.attr("r", baseRadius)
					.style("fill", charColor);

				//Add extra elements depending on the state of the character
				if(d.state === "Super Saiyan" || d.state === "Second Form" || d.state === "Semi-Perfect Form" || d.state === "Super") {
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
				} else if(d.state === "Candy") { //Vegito
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
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};	

