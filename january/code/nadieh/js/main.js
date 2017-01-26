var isMobile = document.documentElement.clientWidth < 400 ? true : false; //window.screen.width < 400 ? true : false;

if(isMobile) {
	d3.selectAll(".mobile").style("display", "inline-block");
	d3.selectAll(".desktop").style("display", "none");
}
//else {

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	var windowWidth = document.documentElement.clientWidth;

	var minWidth = 450,
		maxWidth = document.documentElement.clientWidth > 1200 ? 1000 : 800,
		scrollBarPadding = 10,
		outerWidth = Math.max(minWidth, Math.min(document.documentElement.clientWidth - scrollBarPadding, maxWidth));

	//Scale to figure out the optimum left and right margins
	var widthScale = d3.scaleLinear()
		.domain([450, 1000])
	    .range([60, 150]);

	var margin = {
	  top: Math.round(widthScale(outerWidth)),
	  right: Math.round(widthScale(outerWidth)),
	  bottom: Math.round(widthScale(outerWidth)),
	  left: Math.round(widthScale(outerWidth))
	};
	//Finally the actual width and height of the fight visual
	var width = outerWidth - margin.left - margin.right;
	var height = 6.5*width;
		
	//Offset for the centering of the SVG
	var tooltipOffset = window.innerWidth > maxWidth ? (window.innerWidth - outerWidth)/2 : scrollBarPadding/2;

	//Adjust the width of the explanation text to the visual itself of the page is big enough
	if(windowWidth >= 768) d3.selectAll(".visual-width").style("max-width", width + "px");
	else d3.selectAll(".visual-width").style("padding-right", "15px").style("padding-left", "15px"); 

	//SVG container
	var svg = d3.select('#fight-visual')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("class", "top-wrapper")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

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
		{character: "Krillin", color: "#E3A688"}, //unique
		{character: "Piccolo", color: "#56B13E"}, //unique
		{character: "Future Trunks", color: "#D8A3FA"}, //Trunks unique
		{character: "Tien Shinhan", color: "#C30703"}, //Tien & Chiaotzu
		{character: "Chiaotzu", color: "#C30703"}, //Tien & Chiaotzu
		{character: "Yamcha", color: "#F53B00"}, //unique
		{character: "Gotenks", color: "#6ED3C1"}, //unique
		{character: "Goten", color: "#f2b252"}, //unique
		{character: "Trunks", color: "#D8A3FA"}, //Trunks unique
		{character: "Raditz", color: "#0B2D52"}, //Raditz & Nappa
		{character: "Nappa", color: "#0B2D52"}, //Raditz & Nappa
		{character: "Captain Ginyu", color: "#A287CD"}, //unique
		{character: "Frieza", color: "#82307E"}, //unique
		{character: "Android 16", color: "#383838"},
		{character: "Android 17", color: "#383838"},
		{character: "Future Android 17", color: "#383838"},
		{character: "Android 18", color: "#383838"},
		{character: "Future Android 18", color: "#383838"},
		{character: "Android 19", color: "#383838"},
		{character: "Android 20", color: "#383838"},
		{character: "Cell", color: "#9DBD2A"}, //unique
		{character: "Cell Jr.", color: "#0EC1F8"},
		{character: "Future Cell", color: "#9DBD2A"},
		{character: "Babidi", color: "#D4AB03"}, //unique
		{character: "Dabura", color: "#E67152"}, //unique
		{character: "Evil Buu", color: "#C8B4C0"},
		{character: "Good (Majin) Buu", color: "#FFBBBE"},
		{character: "Buu", color: "#F390A4"}, //unique
		{character: "Vegito", color: "url(#vegito-gradient)"}, //unique combined gradient of Goku & Vegeta
	];
	var names = characters.map(function(d) { return d.character; });
	
	//For the tooltip
	var charColors = characters.map(function(d) { return d.color; });
	//Remove "Buu" & "Good (Majin) Buu" & "Vegito"
    var tooltipNames = names.slice(0, names.length-3);
    //Add the Buu forms (in regex) & Vegito in 1 color
    tooltipNames = tooltipNames.concat(["Good \\(Majin\\) Buu","Majin Buu","Super Buu","Kid Buu","Vegito"]);
    var tooltipColors = charColors.slice(0, charColors.length-1);
    tooltipColors = tooltipColors.concat(["#F390A4","#F390A4","#39100A"]);

	//Characters to follow across sub sagas
	var fullCharacters = ["Goku","Piccolo","Krillin","Gohan","Future Trunks","Gotenks","Vegeta","Frieza","Cell","Buu"];
	//Possible extra: ["Tien Shinhan","Yamcha","Chiaotzu","Trunks","Goten"]

	var oddStatesData = [
		{state: "Mecha", color: "#cccccc"}, //Frieza vs Future Trunks
		{state: "Goku's body", color: "#f27c07"}, //By Captain Ginyu
		{state: "Great Ape", color: "#361607"}, //Gohan and Vegeta
		{state: "Great Saiyaman", color: "#6DD903"}, //Gohan
		{state: "Candy", color: "#39100A"}, //Vegito
		{state: "Mighty Mask", color: "#005758"}, //Goten & Trunks
	];
	var oddStates = oddStatesData.map(function(d) { return d.state; });
	var oddStatesColor = oddStatesData.map(function(d) { return d.color; });

	//Special fights
	var specialFights = [
		{fightID: 4, fightSaga: "Raditz Saga", horizontalOffset: 7, hExtra: -0.3, imgRatio: 178/100, imgRatioMobile: 178/100, hExtraMobile: 0.2, img_url: "Raditz_is_killed.gif", stroke: "#f27c07", fightText: "Goku sacrifices himself so Piccolo can kill Goku's evil brother Raditz", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 18, fightSaga: "Vegeta Saga", horizontalOffset: 4, hExtra: 0.75, imgRatio: 134/100, imgRatioMobile: 133/100, hExtraMobile: 0.65, img_url: "Vegeta_over_9000.gif", stroke: "#1D75AD", fightText: "The most famous DBZ meme is when Vegeta measures Goku's power level (who's back from the dead) and screams in anger 'It's over 9000!'", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 19, fightSaga: "Vegeta Saga", horizontalOffset: -3.5, hExtra: 0.2, imgRatio: 149/100, imgRatioMobile: 118/100, hExtraMobile: 0.95, img_url: "Goku_fights_Vegeta.gif", stroke: "#f27c07", fightText: "An epic battle ensues between Goku and Vegeta lasting several episodes", textX: -1.25, textY: 1.25, textAnchor: "start" },
		{fightID: 55, fightSaga: "Frieza Saga", horizontalOffset: 3, hExtra: 0.2, imgRatio: 187/100, imgRatioMobile: 134/100, hExtraMobile: 0.8, img_url: "Goku_fights_Frieza.gif", stroke: "#82307E", fightText: "Goku and the others (although Vegeta was just killed by Frieza) try valiantly but they're no match for Frieza", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 60, fightSaga: "Frieza Saga", horizontalOffset: 5, hExtra: 0.2, imgRatio: 178/100, imgRatioMobile: 133/100, hExtraMobile: 0.7, img_url: "Goku_goes_Super_Saiyan.gif", stroke: "#f27c07", fightText: "After seeing his friend Krillin get destroyed by Frieza, Goku finally loses it and magnificently turns into a Super Saiyan", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 67, fightSaga: "Trunks Saga", horizontalOffset: -4.5, hExtra: 0.2, imgRatio: 178/100, imgRatioMobile: 180/100, hExtraMobile: 0.3, img_url: "Trunks_kills_Frieza.gif", stroke: "#D8A3FA", fightText: "A cybernetically enhanced Frieza comes to Earth to kill all, but is swiftly sliced in half by Future Trunks", textX: -1.25, textY: 1.25, textAnchor: "start" },
		{fightID: 69, fightSaga: "Trunks Saga", horizontalOffset: 6, hExtra: 0.6, imgRatio: 133/100, imgRatioMobile: 178/100, hExtraMobile: 0, img_url: "Trunks_tests_Goku.gif", stroke: "#D8A3FA", fightText: "Trunks spars with Goku to test Goku's strength", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 104, fightSaga: "Cell Games Saga", horizontalOffset: -6, hExtra: 0.4, imgRatio: 178/100, imgRatioMobile: 126/100, hExtraMobile: 0.9, img_url: "Gohan_goes_SSJ2.gif", stroke: "#3e216d", fightText: "Enraged with Cell for killing Android 16, and the Cell Juniors' beating his friends, Gohan's hidden power erupts, transforming him into a Super Saiyan 2", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 108, fightSaga: "Cell Games Saga", horizontalOffset: 2.5, hExtra: 0.4, imgRatio: 178/100, imgRatioMobile: 177/100, hExtraMobile: 0.3, img_url: "Gohan_kills_Cell.gif", stroke: "#3e216d", fightText: "Releasing all the energy he has, Gohan's Father-Son Kamehameha is strong enough to vaporize every cell in Cell's body", textX: 1.25, textY: -1, textAnchor: "start" },
		{fightID: 128, fightSaga: "Babidi Saga", horizontalOffset: -8, hExtra: 0.8, imgRatio: 133/100, imgRatioMobile: 177/100, hExtraMobile: 0.3, img_url: "Goku_fights_Majin_Vegeta.gif", stroke: "#f27c07", fightText: "After Vegeta lets Babidi control him so he could become evil again the second epic battle between Goku and (Majin) Vegeta starts", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 134, fightSaga: "Majin Buu Saga", horizontalOffset: -5, hExtra: 0.2, imgRatio: 179/100, imgRatioMobile: 125/100, hExtraMobile: 0.9, img_url: "Vegeta_sacrifice.gif", stroke: "#1D75AD", fightText: "One of the best DBZ moments happens when Vegeta sacrifices himself for his family to destroy Majin Buu (which sadly doesn't work)", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 147, fightSaga: "Fusion Saga", horizontalOffset: -7, hExtra: 0.5, imgRatio: 139/100, imgRatioMobile: 134/100, hExtraMobile: 0.9, img_url: "Vegito_fights_Super_Buu.gif", stroke: "url(#vegito-gradient)", fightText: "After nothing else works, Goku and Vegeta fuse to become Vegito, who dominates over Super Buu, even when turned into a jawbreaker", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 156, fightSaga: "Kid Buu Saga", horizontalOffset: -10, hExtra: -0.1, imgRatio: 178/100, imgRatioMobile: 178/100, hExtraMobile: 0.3, img_url: "Goku_fights_Kid_Buu.gif", stroke: "#F390A4", fightText: "Goku unleashes his Super Saiyan 3 form to fight Kid Buu, but it's still not enough", textX: -1.25, textY: -1, textAnchor: "end" },
		{fightID: 162, fightSaga: "Kid Buu Saga", horizontalOffset: -7, hExtra: -0.3, imgRatio: 201/100, imgRatioMobile: 178/100, hExtraMobile: 0.4, img_url: "Goku_kills_Kid_Buu.gif", stroke: "#f27c07", fightText: "After getting the energy from everybody on Earth (thanks to Mr. Satan) Goku finally kills Kid Buu with a massive Spirit Bomb", textX: -1.25, textY: -1, textAnchor: "end" },
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
	//var extraOffset = outerWidth === 1000 ? (window.innerWidth - 1000)/2 : 0;
	//d3.select("body").style("background","radial-gradient(circle closest-corner at " + Math.round(margin.left + extraOffset) + "px " + Math.round(margin.top) + "px, #fdf0db 0%, #fdf6db 100%, #FFFFFF 300%)");
	//d3.select("body").style("background","radial-gradient(circle closest-corner at " + Math.round(margin.left + extraOffset) + "px " + Math.round(margin.top) + "px, #0e4948 0%, #00081c 700%)");

	//Container for the gradients
	var defs = svg.append("defs");

	var annotationCircleSize = sagaScale(2) - sagaScale(1);
	//Create wrapper for the clip paths
	var imageWrapper = defs.append("g").attr("class", "image-group-wrapper");

	//Had to add img width otherwise it wouldn't work in Safari & Firefox
	//http://stackoverflow.com/questions/36390962/svg-image-tag-not-working-in-safari-and-firefox
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
			.attr("height", 2*annotationCircleSize)
			.attr("width", function(d) { return (isMobile ? d.imgRatioMobile : d.imgRatio) * 2*annotationCircleSize; });

	//Code taken from http://stackoverflow.com/questions/9630008/how-can-i-create-a-glow-around-a-rectangle-with-svg
	//Filter for the outside glow
	var filter = defs.append("filter")
	  .attr("id","shadow");

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

	//Filter for the outside glow of the character circles
	var filterGlow = defs.append("filter")
	  	.attr("id","glow")
	  	.attr("x", "-25%")
		.attr("y", "-25%")
	  	.attr("height", "150%")
	  	.attr("width", "150%");

	filterGlow.append("feGaussianBlur")
	  .attr("stdDeviation","2")
	  .attr("result","coloredBlur");

	var feMergeGlow = filterGlow.append("feMerge");
	feMergeGlow.append("feMergeNode")
	  .attr("in","coloredBlur");
	feMergeGlow.append("feMergeNode")
	  .attr("in","SourceGraphic");

	//Create a gradient to fill the title words of Protagonist & Antagonist
	var titleGradient = defs.append("linearGradient")             
		.attr("id", "legend-title-gradient")   
		.attr("x1", 0).attr("y1", 0)         
		.attr("x2", 1).attr("y2", 1);
	titleGradient.append("stop").attr("offset", "0%").attr("stop-color", "#FFC200");
	titleGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ff6c00");

	//Create a gradient for the saga lines, from transparent to grey to transparent again
	var sagaLineGradient = defs.append("linearGradient")    
		.attr("x1", 0).attr("y1", 0)         
		.attr("x2", 0).attr("y2", 1)                 
		.attr("id", "saga-line-gradient");
	sagaLineGradient.append("stop").attr("offset", "0%").attr("stop-color", "#d3d3d3").attr("stop-opacity", 0);
	sagaLineGradient.append("stop").attr("offset", "10%").attr("stop-color", "#d3d3d3");
	sagaLineGradient.append("stop").attr("offset", "90%").attr("stop-color", "#d3d3d3");
	sagaLineGradient.append("stop").attr("offset", "100%").attr("stop-color", "#d3d3d3").attr("stop-opacity", 0);

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

	//Create arrow marker for the saga line legend
	defs.append("marker")
	    .attr("id", "triangle")
	    .attr("refX", 6)
	    .attr("refY", 6)
	    .attr("markerWidth", 30)
	    .attr("markerHeight", 30)
	    .attr("orient", "auto")
	    .append("path")
	    .attr("class", "saga-line-legend-arrow")
	    .attr("d", "M 0 0 12 6 0 12 3 6");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Read in the data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	d3.queue() 
	  .defer(d3.csv, "../../data/nadieh/dragonball_Z_fight_per_person.csv")
	  .defer(d3.csv, "../../data/nadieh/dragonball_Z_fights_cleaned.csv")
	  .await(draw);

	function draw(error, data, fightData) {

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Final data prep /////////////////////////////
		///////////////////////////////////////////////////////////////////////////
		
		if (error) throw error;
		
		data.forEach(function(d) {
			d.id = +d.id;
		});

		var fightLink = [];
		//Create a mapping between the fights and fightData
		fightData.forEach(function(d,i) {
			d.id = +d.id;
			fightLink[d.id] = i;
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
		var backgroundCircleFactor = 7; //How many times the baseRadius should the background circle become
		var hoverScaleIncrease = 3; //How much should the fight group be scaled up
		var sagaDistance = sagaScale(2) - sagaScale(1); //Number of pixels between two sagas

		var xSwoopDist = sagaDistance/2;

		//Make sure the tooltip doesn't become too wide
		var tooltipWidth = window.innerWidth < minWidth ? outerWidth/2 : window.innerWidth/2;
		d3.select("#tooltip-container")
			.style("max-width", Math.min(300, (tooltipWidth - 2*25 - baseRadius*backgroundCircleFactor*hoverScaleIncrease - sagaDistance/2)) + "px");

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

		//Add a legend for the sagas
		sagaLine.append("text")
			.attr("class","saga-legend-text")
			.attr("x", sagaScale(sagaScale.domain()[0]))
			.attr("y", fightScale(-1.5))
			.attr("dy", "0.3em")
			.text("First saga");

		sagaLine.append("text")
			.attr("class","saga-legend-text")
			.attr("x", sagaScale(sagaScale.domain()[1]))
			.attr("y", fightScale(-1.5))
			.attr("dy", "0.3em")
			.text("Last saga");

		sagaLine.append("line")
			.attr("class", "saga-line-legend")
			.attr("x1", sagaScale(sagaScale.domain()[0] + 1.5) )
			.attr("y1", fightScale(-1.5))
			.attr("x2", sagaScale(sagaScale.domain()[1] - 1.5) )
			.attr("y2", fightScale(-1.5))
			.attr("marker-end", "url(#triangle)");

		//Sloghtly adjust the width to include the legend text as well
		if(windowWidth >= 768) d3.selectAll(".visual-width").style("max-width", (document.getElementsByClassName("saga-line-wrapper")[0].getBBox().width) + "px");

		///////////////////////////////////////////////////////////////////////////
		//////////////////////// Create the character paths ///////////////////////
		///////////////////////////////////////////////////////////////////////////

		var characterLineWrapper = svg.append("g").attr("class", "character-line-wrapper");

		//Save the path information for later use in the mini map
		var characterPaths = [],
			counter = 0;

		var characterLines = characterLineWrapper.selectAll(".character-path-group")
			.data(characterNestedData)
			.enter().append("g")
			.attr("class", function(d) {
				d.className = d.key.replace(" ", "_").toLowerCase();
				return "character-path-group " + d.className; 
			})
			.style("stroke", function(d,i) {
				var loc = names.indexOf(d.key);
				d.color = loc > -1 ? characters[loc].color === "#" ? "#515151" : characters[loc].color : "#c1c1c1";
				return d.color;
			})
			.style("stroke-width", 1)
			.style("fill", function(d,i) { return d.color; })
			.style("opacity", function(d) { 
				d.opacity = d.key === "Goku" ? 1 : 0.4;
				return d.opacity; 
			})
			.each(function(d,k) {

				//if(k > 0) return;

				var el = d3.select(this);
				var sagaFights = d.values;

				//Is the character a main character that should be followed across saga's?
				var fullChar = fullCharacters.indexOf(d.key) > -1;

				//Save the path & metadata for later use in the mini map
				characterPaths.push([]);
				characterPaths[counter].key = d.key;
				characterPaths[counter].color = d.color;

				//To what side of the saga line should the line swoop (-1 left, 1 right)
				var xSwing = Math.random() > 0.5 ? 1 : -1;
				var jitter = 0, maxJitter, minJitter, jitterUp = 0,
					yDiff,
					xOld, yOld,
					xBaseline;
				var path,
					pathUp;

				//Loop over each saga to calculate the custom path
				sagaFights.forEach(function(s,i) {
					var charFights = s.values;

					//If this isn't a full character and there is only 1 fight in this saga, don't create a line
					if(!fullChar && charFights.length === 1) return;

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

					//Draw the path if this is either the last saga for a main character
					//or the last fight within a saga for the others
					if(!fullChar || (fullChar && i === sagaFights.length-1)) {
						//Save the information into a variable for re-use in the mini map
						characterPaths[counter].push(path + pathUp);

						el.append("path")
							.attr("class","character-path")
							.attr("d", path + pathUp);						
					}//if

				});

				counter += 1;

			})
			.on("mouseover", function(d) {

				//Make the hovered line more visible and rest less (also in the mini map)
				d3.selectAll(".character-path-group")
					.transition("fade").duration(300)
					.style("opacity", 0.05);
				d3.selectAll(".character-path-group." + d.className)
					.transition("fade").duration(300)
					.style("opacity", 1);

				//Hide all the battles that do not feature the hovered over person
				//fights.filter(function(c) { return c.values.map(function(f) { return f.name; }).indexOf(d.key) === -1; })
				d3.selectAll(".fight")
					.classed("nonactive", function(c) { return c.values.map(function(f) { return f.name; }).indexOf(d.key) === -1; });
				d3.selectAll(".fight.nonactive")
					.transition("fade").duration(300)
					.style("opacity", 0.1);

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
				d3.selectAll(".character-path-group")
					.transition("fade").duration(300)
					.style("opacity", function(c) { return c.opacity; });

				//Fights back to default
				d3.selectAll(".fight")
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

		createCharacterLegend(characters);
		createFightLegend();

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
			.text(function(d) { return "part of the " + d.saga + " arc"; });

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
			.attr("class", function(d,i) { 
				//Give a class of each person in the fight
				var fighters = d.values.map(function(f) { return f.name.replace(" ", "_").toLowerCase(); });
				return "fight " + fighters.join(" "); 
			})
			.style("isolation", "isolate")
			.each(function(d) {
				d.x = this.parentNode.__data__.x;
				d.y = this.parentNode.__data__.y;
				d.numFighters = d.values.length;
				//Take one fighter from the Vegito fusion to make the circles spread correctly around 360 degrees
				if( /Vegito/.test(d.values[0].state) ) d.numFighters -=1;
			})
			.on("mouseover", function(d) {
				var el = d3.select(this);

				//Move the parent group to the front
				d3.select(this.parentNode).raise();

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

				///////////////////////// Adjust the fight circle ////////////////////////

				//Make the fight elements bigger
				el
					.transition("grow").duration(500)
					.attr("transform", "scale(" + hoverScaleIncrease + ")");

				//Move the circles apart
				el.selectAll(".character-circle-group")
					.transition("move").duration(700)
					.attr("transform", function(c,i) { 
						var x = -baseRadius*3 * Math.cos( i * Math.PI * 2 / d.numFighters ),
							y = -baseRadius*3 * Math.sin( i * Math.PI * 2 / d.numFighters );
						return "translate(" + x + "," + y + ")"; 
					});

				//Make the background rect smaller
				el.select(".fight-background")
					.transition().duration(500)
					.attr("y", -backgroundRectSize/2/3)
					.attr("height", backgroundRectSize/3);

				//Make the background circle visible
				el.select(".fight-background-circle")
					.style("filter", "url(#shadow)")
					.transition().duration(500)
					.style("opacity", 1);
	
				///////////////////////// Adjust the tooltip ////////////////////////

				//Get the correct fight data
				var fightInfo = fightData[fightLink[+d.key]];			

				//Find the location of tooltip
				var xpos = d.x + margin.left + tooltipOffset;
				if(+d.key < 88) {
					xpos = xpos + baseRadius*backgroundCircleFactor*hoverScaleIncrease + sagaDistance/2;
					d3.select("#tooltip .tooltip-container").style("left", "50%").style("right", null);
				} else {
					xpos = xpos - baseRadius*backgroundCircleFactor*hoverScaleIncrease - sagaDistance/2;
					d3.select("#tooltip .tooltip-container").style("left", null).style("right", "50%");
				}//else
				var ypos = d.y + margin.top;

				//Change the texts inside the tooltip
				d3.select(".tooltip-saga").html(fightInfo.subSaga);

				//Check to see if any of the main characters are in the string
				//and if yes, make sure they get the right color
				d3.select(".tooltip-characters.good").html(tooltipNameColors(fightInfo.charactersGood));
				//Do the same for the "bad" characters
				d3.select(".tooltip-characters.bad").html(tooltipNameColors(fightInfo.charactersBad));

				//Combine the info & anime variables into 1 row, if present at all
				if (fightInfo.info === "" && fightInfo.anime === "") {
					d3.select(".tooltip-info").style("display", "none").html("");
				} else {
					if (fightInfo.info !== "" && fightInfo.anime !== "") {
						d3.select(".tooltip-info").html(fightInfo.info + " | " + fightInfo.anime);
					} else if (fightInfo.info === "" && fightInfo.anime !== "") {
						d3.select(".tooltip-info").html(fightInfo.anime);
					} else if (fightInfo.info !== "" && fightInfo.anime === "") {
						d3.select(".tooltip-info").html(fightInfo.info);
					}//else if
					d3.select(".tooltip-info").style("display", "inline-block")
				}//else

				//Only show the extra section if there is something to mention
				if (fightInfo.extra === "") {
					d3.select(".tooltip-extra").style("display", "none").html("");
				} else {
					d3.select(".tooltip-extra").style("display", "inline-block").html(fightInfo.extra);
				}//else

				//Show and move the tooltip
				d3.select("#tooltip")
					.transition("tooltip").duration(500)
					.style("opacity", 1)
					.style("top", ypos + "px")
					.style("left", xpos + "px");

				///////////////////////// Hide other aspects ////////////////////////

				//Names of the people in the fight
				var combatants = d.values.map(function(f) { return f.name; });

				//Make all the character lines less visible, except for those in the fight
				d3.selectAll(".character-path-group")
					.transition("fade").duration(300)
					.style("opacity", function(c) { return combatants.indexOf(c.key) === -1 ? 0.05 : 1; });

				//Hide all the battles that do not feature any of the characters in this fight
				//fights.filter(function(c) { return c.values.filter(function(n) { return combatants.indexOf(n.name) != -1; }).length === 0; })
				d3.selectAll(".fight")
					.classed("nonactive", function(c) { return c.values.filter(function(n) { return combatants.indexOf(n.name) != -1; }).length === 0; });
				d3.selectAll(".fight.nonactive")
					.transition("fade").duration(300)
					.style("opacity", 0.1);

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
						var x = -baseRadius*baseDistanceRatio * Math.cos( i * Math.PI * 2 / d.numFighters ),
							y = -baseRadius*baseDistanceRatio * Math.sin( i * Math.PI * 2 / d.numFighters );
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
				d3.selectAll(".character-path-group")
					.transition("fade").duration(300)
					.style("opacity", function(c) { return c.opacity; });

				//Make all the fights visible
				d3.selectAll(".fight")
					.transition("fade").duration(300)
					.style("opacity", 1);

				//Hide tooltip
				d3.select("#tooltip").transition("tooltip").duration(300)
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
			.attr("r", baseRadius*backgroundCircleFactor)
			.style("opacity", 0);

		//Create circles along the saga lines
		var fightCharacter = fights.selectAll(".character-circle-group")
			.data(function(d) { return d.values; })
			.enter().append("g")
			.attr("class","character-circle-group")
			.attr("transform", function(d,i) { 
				d.x = -baseRadius*baseDistanceRatio * Math.cos( i * Math.PI * 2 / this.parentNode.__data__.numFighters );
				d.y = -baseRadius*baseDistanceRatio * Math.sin( i * Math.PI * 2 / this.parentNode.__data__.numFighters );
				return "translate(" + d.x + "," + d.y + ")"; 
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
				d.color = loc > -1 ? characters[loc].color : "#c1c1c1";

				el.append("circle")
					.attr("class", "character-circle")
					.attr("r", baseRadius)
					.style("fill", d.color);

				//Add extra elements depending on the state of the character
				if(d.state === "Super Saiyan" || d.state === "Vegito Super Saiyan" || d.state === "Second Form" || d.state === "Semi-Perfect Form" || d.state === "Super") {
					firstPower(el, d.color, 1.5, 1);
				} else if(d.state === "2nd Grade Super Saiyan") {
					firstPower(el, d.color, 1.5, 1.5);
				} else if(d.state === "3rd Grade Super Saiyan") {
					firstPower(el, d.color, 1.6, 2);
				} else if(d.state === "Full-Power Super Saiyan") {
					firstPower(el, d.color, 1.75, 2.5);
				} else if(d.state === "Super Saiyan 2" || d.state === "Third Form" || d.state === "Perfect Form" || d.state === "Kid") {
					firstPower(el, d.color, 1.5, 1);
					secondPower(el, d.color, 2, 1);
				} else if(d.state === "Majin Super Saiyan 2") { //Vegeta
					firstPower(el, d.color, 1.5, 1);
					secondPower(el, d.color, 2, 1);
					el.append("text")
						.attr("class", "majin-text")
						.attr("dy","0.35em")
						.text("M");
				} else if(d.state === "Perfect and Power-weighted Form") { //Cell
					firstPower(el, d.color, 1.5, 1);
					secondPower(el, d.color, 2.1, 1.5);
				} else if(d.state === "Super Saiyan 3" || d.state === "Final Form" || d.state === "Super Perfect Form" ) {
					firstPower(el, d.color, 1.5, 1);
					secondPower(el, d.color, 2, 1);
					thirdPower(el, d.color);
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

		///////////////////////////////////////////////////////////////////////////
		/////////////////////// Add the mini map to the right /////////////////////
		///////////////////////////////////////////////////////////////////////////

		createFightMap(width, height, margin, characterPaths, fightNestedData, baseRadius);

	}//draw

//}//else

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Extra functions ///////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Round number to 2 behind the decimal
function round2(num) {
	return (Math.round(num * 100)/100).toFixed(2);
}//round2

// //Bring the mousovered fight to the front
// //http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
// d3.selection.prototype.moveToFront = function() {
//   return this.each(function(){
//     this.parentNode.appendChild(this);
//   });
// };	
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

//Function to take apart the names of the good and "bad" fighters and give each characters name
//the right color using spans
function tooltipNameColors(string) {

	for(var j = 0; j < tooltipNames.length; j++) {
		//Match the name (except for Goten, not ending on "ks", Cell not ending on Jr. and Goku not ending on Goku's)
		//and if there is anything in ()
		var reg = new RegExp(tooltipNames[j] + "( \\([-&%'\\d\\w\\s]+\\)|(?!ks| Jr|'s))","i");
		string = string.replace(reg, function(k, match) {
			//console.log(k, match);
			var newHTML;

			//If the () is a match, check if it is one of the special states
			//and if yes, replace this with the right color
			if(match.length > 0) {
				match.replace(/\(([-&%'\d\w\s]+)\)/i, function(m, matchInside) {
					//console.log(m, matchInside);
					var specialState = oddStates.indexOf(matchInside);
					if(specialState >= 0) {
						//remove the special state from k
						k = k.replace(m," ");
						newHTML = '<span style="color: ' + tooltipColors[j] + ';">' + k + '</span><span style="color: ' + oddStatesColor[specialState] + ';">(' + matchInside + ')</span>';
					} else {
						newHTML = '<span style="color: ' + tooltipColors[j] + ';">' + k + '</span>';
					}
				});//match replace

			} else {
				newHTML = '<span style="color: ' + tooltipColors[j] + ';">' + k + '</span>';
			}//else

			return newHTML;
		});//string replace
	}//for j

	return string;
}//function tooltipNameColors

