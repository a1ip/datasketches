
var width = document.body.clientWidth; 
var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);

var canvas  = d3.select("#chart").append("canvas")
	.attr("id", "canvas")
	.attr("width", width)
	.attr("height", height);
	
var ctx = canvas.node().getContext("2d");

///////////////////////////////////////////////////////////////////////////
///////////////////////// Create global variables /////////////////////////
///////////////////////////////////////////////////////////////////////////

ctx.globalCompositeOperation = "screen";
ctx.lineCap = "round";

var ID = 0;
var bf = [];

var colorMap = [];
colorMap["red"] 	= "#CE1836";
colorMap["copper"] 	= "#E14B18";
colorMap["orange"] 	= "#FA6900";
colorMap["yellow"] 	= "#FABE28";
colorMap["green"] 	= "#8FBE00";
colorMap["blue"] 	= "#00A8C6";
colorMap["purple"] 	= "#6E1E62";
colorMap["white"] 	= "#ffffff";
colorMap["grey"] 	= "#BDB8AD";
colorMap["black"] 	= "#000000";

var radius = Math.min(200, width/3, height/3);
var hex = hexArray(width, height, radius);

//Is the credit rect shown
var shown = false;
d3.select(".credit-rect").style("opacity", 0);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Read in the data /////////////////////////////
///////////////////////////////////////////////////////////////////////////

d3.csv('../../data/nadieh/butterflies.csv', function (error, data) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Final data prep /////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	if (error) throw error;

	//Take out some butterflies based on color
	data = data.filter(function(d) { return d.color !== "brown"; }); //&& d.color !== "black" && d.color !== "grey"

	//Get the wingspan size: small, medium or large
	data.forEach(function(d) {
		d.size = d.wingspan.split(" ")[0].toLowerCase();
	})//for each

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Let the butterflies loose ////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var timer = d3.interval(function(elapsed) {

		//For now stop after 30 seconds
		if (elapsed > 60000) {
			console.log("stopping", ID, bf.length);
			timer.stop();
		} else if (elapsed > 30000 && !shown) {
			d3.select(".credit-rect").transition().duration(4000).style("opacity", 1);
			shown = true;
		}//else if

		//Create new butterflies
		//for (var i = 0; i < Math.round(Math.random()*2); i++) spawn(data[Math.round(getRandomNumber(0, data.length-1))]);
		spawn(data[Math.round(getRandomNumber(0, data.length-1))]);

		//Remove non-alive butterflies
		bf = bf.filter(function(d) { return d.alive; });

		for (var i = 0; i < bf.length; i++) {

	      	ctx.setLineDash([]);

	      	if(bf[i].species === "Skippers") { //Create circles
	      		ctx.fillStyle = bf[i].color;
	      		ctx.globalAlpha = bf[i].opacity * 0.1;
	      		var start = 0 ;//bf[i].pos.length - 3;
	      		//if(bf[i].pos.length < 10) start = 0;
    			for(var j = start; j < bf[i].pos.length-1; j++) {
    				ctx.beginPath();
    				ctx.arc(bf[i].pos[j].x + (Math.random()>0.5 ? 1 : -1) * Math.random()*bf[i].lineWidth, 
    						bf[i].pos[j].y + (Math.random()>0.5 ? 1 : -1) * Math.random()*bf[i].lineWidth, 
    						bf[i].pos[j].radius, 0, 2*Math.PI, 1);
    				ctx.closePath();
    				ctx.fill();
    			}//for j
	      	} else { //Create curved lines
	      		ctx.strokeStyle = bf[i].color;
	      		ctx.globalAlpha = bf[i].opacity;
	      		ctx.lineWidth = bf[i].lineWidth;
		      	if(bf[i].lineWidth < 2) {
		      		ctx.setLineDash([bf[i].lineWidth/8, bf[i].lineWidth*4]); /*dashes are Xpx and spaces are Ypx*/
		      	}//if

				//Draw a smooth curve through the points
	      		drawCurve(ctx, bf[i].pos, Math.random());	     		
	      	}//else

			//Adjust the path of the butterflies a bit
			jitter(bf[i].pos, bf[i].jitter);

			//Add a new point to the butterfly if it is still inside the screen
			if(!bf[i].outside) {
				move(bf[i]);
				bf[i].pos.push({x: +round2(bf[i].x), y: +round2(bf[i].y), radius: +round2(bf[i].radius)});

				//Check if the butterfly is outside of the canvas area
				if(bf[i].pos[bf[i].pos.length-1].x < 0 || bf[i].pos[bf[i].pos.length-1].x > width ||
				   bf[i].pos[bf[i].pos.length-1].y < 0 || bf[i].pos[bf[i].pos.length-1].y > height ) {
					bf[i].outside = true;
				}//if
			}//if

		}//for i

		//"Kill" the oldest butterflies if more than 400 exist already
		if(bf.length > 300) {
			for (var i = 0; i < bf.length-300; i++) {
				bf[i].alive = false;
			}//for i
		}//if

		//Draw the hexagon
		ctx.strokeStyle = "white";
      	ctx.globalAlpha = 0.05;
      	ctx.lineWidth = 2;
      	ctx.beginPath();
      	ctx.moveTo(hex[0].x + (Math.random()>0.5 ? 1 : -1) * Math.random()*7, 
      			   hex[0].y + (Math.random()>0.5 ? 1 : -1) * Math.random()*7);
		for (var i = 1; i < hex.length; i++) {
			ctx.lineTo(hex[i].x + (Math.random()>0.5 ? 1 : -1) * Math.random()*7, 
					   hex[i].y + (Math.random()>0.5 ? 1 : -1) * Math.random()*7);
		}//for i
		ctx.closePath();
		ctx.stroke();
		//Draw the circle
		ctx.globalAlpha = 0.025;
		ctx.beginPath();
      	ctx.arc(width/2 + (Math.random()>0.5 ? 1 : -1) * Math.random()*5, 
    			height/2 + (Math.random()>0.5 ? 1 : -1) * Math.random()*5, 
    			radius*1.2, 0, 2*Math.PI, 1);
		ctx.closePath();
		ctx.stroke();

	}, 50);//timer

})//d3.csv

//arc(x, y, radius, startAngle, endAngle, anticlockwise)

//quadraticCurveTo(cp1x, cp1y, x, y)
//Draws a quadratic Bézier curve from the current pen position to the end point specified by x and y, using the control point specified by cp1x and cp1y.

//bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
//Draws a cubic Bézier curve from the current pen position to the end point specified by x and y, using the control points specified by (cp1x, cp1y) and (cp2x, cp2y).

///////////////////////////////////////////////////////////////////////////
/////////////////////// Create & move the butterfly ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Jitter the existing path a bit
function jitter(d, jitter) {
	for(var i = 0; i < d.length; i++) {
		d[i].x = +d[i].x + jitter * (Math.random() > 0.5 ? 1 : -1);
		d[i].y = +d[i].y + jitter * (Math.random() > 0.5 ? 1 : -1);
	}//for i
}//jitter

//Calculates the new path to draw
function move(d) {

	d.radius = d.lineWidth*Math.random()*4;

	d.x += d.vx;
	d.y += d.vy;

	d.vx *= d.drag;
	d.vy *= d.drag;

	if(Math.random() > 0.9) d.direction = -1*d.direction;

	d.theta += d.direction * getRandomNumber( 0, 0.4 ); //getRandomNumber( -1, 1 ) * d.wander;
	d.vx += Math.sin( d.theta ) * d.wander
	d.vy += Math.cos( d.theta ) * d.wander;
}//move

function spawn(d) {

	//Some variables depend on the "size" of the butterfly
	var lineWidth = round2(getRandomNumber( 1, 1.5 ));
	var opacity = getRandomNumber( 0.02, 0.08 )
	var jitter = getRandomNumber( 0.4, 1.4 );
	var force = getRandomNumber( 3, 8 );
	if(d.size === "medium") {
		lineWidth = round2(getRandomNumber( 1.5, 3 ));
		opacity = getRandomNumber( 0.005, 0.025 );
		jitter = getRandomNumber( 0.5, 2 );
		force = getRandomNumber( 4, 9 );
	} else if (d.size === "large") {
		lineWidth = round2(getRandomNumber( 3, 8 ));
		opacity = getRandomNumber( 0.0025, 0.005 );
		jitter = getRandomNumber( 1, 3);
		force = getRandomNumber( 6, 10 );
	}//else if

	var startLoc = findstartLoc(width, height);

	//Create the butterfly
	butterfly = {
		id: ID,			
		
		lineWidth: lineWidth,
		radius: lineWidth,
		opacity: opacity,
		color: colorOffset(colorMap[d.color]),
		species: d.species,

		x: startLoc[0], //width/2,
		y: startLoc[1], //height/2,
		wander: getRandomNumber( 1.5, 4 ),
		drag: getRandomNumber( 0.85, 0.99 ),
		theta: startLoc[2], //getRandomNumber( -Math.PI,  Math.PI ),
		force: force,
		jitter: jitter,

		outside: false,
		alive: true
	};

	//Set the speed of the butterfly
	butterfly.vx = Math.sin( butterfly.theta ) * butterfly.force;
	butterfly.vy = Math.cos( butterfly.theta ) * butterfly.force;
	butterfly.direction = d.theta >= 0 ? 1 : -1;

	var pos = [];
	//Create some starting positions for butterfly
	for(var i = 0; i < 6; i++) {
		move(butterfly);
		pos.push({x: +round2(butterfly.x), y: +round2(butterfly.y), radius: +round2(butterfly.radius)});
	}//for i
	butterfly.pos = pos;

	ID += 1;

	bf.push( butterfly );
}//spawn

///////////////////////////////////////////////////////////////////////////
///////////////////////// Get the hexagon points //////////////////////////
///////////////////////////////////////////////////////////////////////////

function hexArray(width, height, radius) {

	var SQRT3 = Math.sqrt(3),
    	hexRadius = radius;
	var hexagonPoly = [[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	
	//For SVG path
	//var hexagonPath = " m" + hexagonPoly.map(function(p){ return [+round2(p[0]*hexRadius), +round2(p[1]*hexRadius)].join(','); }).join(' l') + "z";
	//return "M" + (width/2) + "," + (height/2) + hexagonPath;
	
	//Return array of {x: x, y:y }
	var hexagonPath = hexagonPoly.map(function(p){ return {x: +round2(p[0]*hexRadius + width/2), y: +round2(p[1]*hexRadius + height/2)} });
	return hexagonPath;
}//function hexArray

///////////////////////////////////////////////////////////////////////////
///////////////////////// Sample points along line ////////////////////////
///////////////////////////////////////////////////////////////////////////

function findstartLoc(width, height) {
	if(Math.random() > 0.5) {
		if(Math.random() > 0.5) {
			//before x axis
			return [-10, getRandomNumber(0, height), getRandomNumber(0, Math.PI)];
		} else {
			//after x axis
			return [width+10, getRandomNumber(0, height), getRandomNumber(Math.PI, 2*Math.PI)];
		}//else
	} else {
		if(Math.random() > 0.5) {
			//above y axis
			return [getRandomNumber(0, width), -10, getRandomNumber(-Math.PI/2, Math.PI/2)];
		} else {
			//below y axis
			return [getRandomNumber(0, height), height + 10, getRandomNumber(Math.PI/2, Math.PI*3/2)];
		}//else
	}//else
}//function findstartLoc


// function translateAlong(path) {
//   var l = path.getTotalLength();
//   return function(d, i, a) {
//     return function(t) {
//       var p = path.getPointAtLength(t * l);
//       return "translate(" + p.x + "," + p.y + ")";
//     };
//   };
// }

// var d1 = pt.chordToLoom.adjustedRibbon(d), 
//       			precision = 4;

// 	      	var path0 = this,
// 		        path1 = path0.cloneNode(),
// 		        n0 = path0.getTotalLength(),
// 		        n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

// 		    // Uniform sampling of distance based on specified precision.
// 		    var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
// 		    while ((i += dt) < 1) distances.push(i);
// 		    distances.push(1);

// 		    // Compute point-interpolators at each distance.
// 		    var points = distances.map(function(t) {
// 		      var p0 = path0.getPointAtLength(t * n0),
// 		          p1 = path1.getPointAtLength(t * n1);
// 		      return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
// 		    });

// 		    return function(t) {
// 		      return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
// 		    };

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the curved lines //////////////////////////
///////////////////////////////////////////////////////////////////////////

//Adjusted from 
//http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
function drawCurve(ctx, ptsa, tension, isClosed, numOfSegments, showPoints) {

  	ctx.beginPath();
  	drawLines(ctx, getCurvePoints(ptsa, tension, isClosed, numOfSegments));
  
  	if (showPoints) {
    	ctx.beginPath();
    	for(var i = 0; i < ptsa.length-1; i++) ctx.rect(ptsa[i].x - 2, ptsa[i].y - 2, 4, 4);
  	}//if

    ctx.stroke();
  	//ctx.closePath();
}//function drawCurve

function drawLines(ctx, pts) {
	ctx.moveTo(pts[0].x, pts[0].y);
	for(var i = 1; i < pts.length-1; i++) ctx.lineTo(pts[i].x, pts[i].y);
}//drawLines

function getCurvePoints(pts, tension, isClosed, numOfSegments) {

  // use input value if provided, or use a default value	 
  tension = (typeof tension != 'undefined') ? tension : 0.5;
  isClosed = isClosed ? isClosed : false;
  numOfSegments = numOfSegments ? numOfSegments : 16;

  var _pts = [], res = [],	// clone array
      x, y,					// our x,y coords
      t1x, t2x, t1y, t2y,	// tension vectors
      c1, c2, c3, c4,		// cardinal points
      st, t, i;				// steps based on num. of segments

  // clone array so we don't change the original
  _pts = pts.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to befinning, end points to end
  if (isClosed) {
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 1]);
    _pts.push(pts[0]);
  } else {
    _pts.unshift(pts[1]);			//copy 1. point and insert at beginning
    _pts.push(pts[pts.length - 1]);	//copy last point and append
  }//else

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1st point before and after
  for (var i = 1; i < (_pts.length - 2); i++) {
    for (var t = 0; t <= numOfSegments; t++) {

      // calc tension vectors
      t1x = (_pts[i+1].x - _pts[i-1].x) * tension;
      t2x = (_pts[i+2].x - _pts[i].x) 	* tension;

      t1y = (_pts[i+1].y - _pts[i-1].y) * tension;
      t2y = (_pts[i+2].y - _pts[i].y) 	* tension;

      // calc step
      st = t / numOfSegments;

      // calc cardinals
      c1 =   2 * Math.pow(st, 3) 	- 3 * Math.pow(st, 2) + 1; 
      c2 = -(2 * Math.pow(st, 3)) 	+ 3 * Math.pow(st, 2); 
      c3 = 	   	 Math.pow(st, 3)	- 2 * Math.pow(st, 2) + st; 
      c4 = 	   	 Math.pow(st, 3)	- 	  Math.pow(st, 2);

      // calc x and y cords with common control vectors
      x = c1 * _pts[i].x + c2 * _pts[i+1].x + c3 * t1x + c4 * t2x;
      y = c1 * _pts[i].y + c2 * _pts[i+1].y + c3 * t1y + c4 * t2y;

      //store points in array
      res.push({x: x, y: y});

    }//for t
  }//for i

  return res;
}//function getCurvePoints

///////////////////////////////////////////////////////////////////////////
////////////////////////////// Extra functions ////////////////////////////
///////////////////////////////////////////////////////////////////////////

//https://github.com/bgrins/TinyColor
//Get a slightly different color, based on the provided color
function colorOffset(color) {
	var colors = tinycolor(color).analogous();
	colors = colors.map(function(t) { return t.toHexString(); }); 

	return colors[Math.floor(Math.random()*colors.length)];
}//function colorOffset

//Get a random number between start and end
function getRandomNumber(start, end) { return ((Math.random() * (end-start)) + start); }	

//Round number to 2 behind the decimal
function round2(num) { return (Math.round(num * 100)/100).toFixed(2); }//round2
