var margin = {
  top: 70,
  right: 10,
  bottom: 10,
  left: 10
};
var width = 720;
var height = 200;

//SVG container
var svg = d3.select('#headerTitle')
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top) + ")");

///////////////////////////////////////////////////////////////////////////
////////////////////////// Create the gradient ////////////////////////////
///////////////////////////////////////////////////////////////////////////

// var defs = svg.append("defs");

// var colors = ["#FFE600", "#FFDC00","#FFCA00","#FFA400","#FF7900","#FF5600","#FF3400","#FF1C00","#D90000","#C52B00","#8F1A31","#AC0062",
// 		"#8D0358","#860062","#72217E","#53357E","#30357F","#254688","#3050B3","#0054E3","#0081E2","#2DACE1","#00C5ED","#00CDD4","#00DECF","#00CDC5",
// 		"#0AB197","#0AB197","#0AB15D","#0AA200","#35BD00","#77E100","#A9E100","#CDE600","#F2F500"];
// var colorScale = d3.scaleLinear()
// 	.range(colors)
// 	.domain(d3.range(colors.length));

// //Create the gradient
// defs.append("linearGradient")
// 	.attr("id", "rainbow")
// 	.attr("x1", "0%").attr("y1", "0%")
// 	.attr("x2", "100%").attr("y2", "0%")
// 	.selectAll("stop") 
// 	.data(colorScale.range())                  
//    	.enter().append("stop")
// 	.attr("offset", function(d,i) { return i/(colorScale.range().length-1); })   
//     .attr("stop-color", function(d) { return d; });

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create the text //////////////////////////////
///////////////////////////////////////////////////////////////////////////

svg.append("image")
	.attr("xlink:href", "img/fuzzy-magic-3.jpg")
	.attr("x", -250)
	.attr("y", -70)
	.attr("width", 500)
	.attr("height", 300)
	.style("opacity", 0.9);

svg.append("text")
	.attr("class", "title-magic")
	.attr("x", 0)
	.attr("y", 110)
	.style("fill", "white")
	.text("Magic");

svg.append("text")
	.attr("class", "title-rest")
	.attr("x", -160)
	.attr("y", 30)
	.text("The");

svg.append("text")
	.attr("class", "title-rest")
	.attr("x", 210)
	.attr("y", 145)
	.text("is everywhere");
