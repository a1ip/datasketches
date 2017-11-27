////////////////////////////////////////////////////////////// 
//////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////// 

var container = d3.select("#chart");

var width = 1200;
var height = 1200;

var canvas_src = container.append("canvas").attr("id", "canvas-source")
var ctx_src = canvas_src.node().getContext("2d");
crispyCanvas(canvas_src, ctx_src, 1);

var canvas_trg = container.append("canvas").attr("id", "canvas-target")
var ctx_trg = canvas_trg.node().getContext("2d");
crispyCanvas(canvas_trg, ctx_trg, 2);

//////////////////////////////////////////////////////////////
//////////////// Initialize helpers and scales ///////////////
//////////////////////////////////////////////////////////////

var num_chapters = 50;

var angle = d3.scaleLinear()
    .domain([0, num_chapters])
    .range([0, 2*Math.PI]); 

var radius_scale = d3.scaleSqrt()
    .domain([0, 1])
    .range([0, 30]); 

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Read in the data /////////////////////////////
///////////////////////////////////////////////////////////////////////////

d3.queue() 
    .defer(d3.json, "../../data/nadieh/ccs_character_per_chapter.json")
    .defer(d3.json, "../../data/nadieh/ccs_color_distribution.json")
    .await(draw);

function draw(error, character_data, color_data) {

    if (error) throw error;

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Final data prep /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // The largest node for each cluster.
    var clusters = new Array(num_chapters);
    var rad = width*0.4;

    color_data.forEach(function(d) {

        d.cluster = d.chapter - 1;
        d.radius = radius_scale(d.percentage);
        d.x = rad * Math.cos(angle(d.cluster) - Math.PI/2) + width/2;
        d.y = rad * Math.sin(angle(d.cluster) - Math.PI/2) + height/2;

        if (!clusters[d.cluster] || (d.radius > clusters[d.cluster].radius)) clusters[d.cluster] = d;

    })//forEach

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Run force simulation //////////////////////////
    ///////////////////////////////////////////////////////////////////////////     

    var simulation = d3.forceSimulation(color_data)
        .force('center', d3.forceCenter(width/2,height/2))
        .force('cluster', d3.forceCluster()
            .centers(function(d) { return clusters[d.cluster]; })
            .strength(1)
            .centerInertia(0.1))
        .force('collide', d3.forceCollide(function(d) { return d.radius*0.8; }).strength(0.7))
        //.alphaDecay(.01)
        .stop();

    //Run the simulation "manually"
    for (var i = 0; i < 600; ++i) simulation.tick();

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Create color circles //////////////////////////
    ///////////////////////////////////////////////////////////////////////////    

    // ctx_src.globalCompositeOperation = "multiply";
    ctx_trg.globalCompositeOperation = "multiply";


    var colors = [
        {angle: 15, hex: "#00FFFF", name: "c"},
        {angle: 75, hex: "#FF00FF", name: "m"},
        {angle: 0, hex: "#FFFF00", name: "y"},
        {angle: 45, hex: "#000000", name: "k"}
    ];
    var pixelsPerPoint = 2;

    //color_data.forEach(function(d,i) { 

    for(var p = 0; p < color_data.length; p++) {

        d = color_data[p];

        var rad = d.radius * 1.1;
        var loc = {x: Math.round(d.x-rad), y: Math.round(d.y-rad), width: Math.round(rad*2), height: Math.round(rad*2)};
        //var loc = {x: 0, y: 0, width: width, height: height};

        ctx_src.fillStyle = "#ffffff";
        ctx_src.fillRect(loc.x, loc.y, loc.width, loc.height);
        //ctx_src.clearRect(0, 0, width, height);
        
        ctx_src.fillStyle = d.color;
        ctx_src.beginPath();
        ctx_src.arc(d.x, d.y, d.radius, 0, 2 * Math.PI, false);
        ctx_src.fill();

        //var imageData = ctx_src.getImageData(loc.x, loc.y, loc.width, loc.height);

        //Longest side of the image
        var hypotenuse = Math.sqrt(loc.width * loc.width + loc.height * loc.height);
        hypotenuse = Math.ceil(hypotenuse / pixelsPerPoint) * pixelsPerPoint;

        for (var c = 0; c < colors.length; c++) {

            var color = colors[c];
            ctx_trg.fillStyle = color.hex;

            var h = {x: hypotenuse * Math.cos(color.angle * Math.PI/180), y: hypotenuse * Math.sin(color.angle * Math.PI/180) }
            var v = {x: hypotenuse * Math.cos((color.angle+90) * Math.PI/180), y: hypotenuse * Math.sin((color.angle+90) * Math.PI/180) }
            var origin = {x: loc.width/2 - h.x/2 - v.x/2, y: loc.height/2 - h.y/2 - v.y/2};
            var rectangle = {x: 0, y: 0, width: loc.width - 1, height: loc.height - 1};

            for (var y = pixelsPerPoint / 2; y <= hypotenuse; y += pixelsPerPoint) {
                var yRatio = y / hypotenuse;
                var pos = {x: v.x * yRatio, y: v.y * yRatio};
                for (var x = pixelsPerPoint / 2; x <= hypotenuse; x += pixelsPerPoint) {
                    var xRatio = x / hypotenuse;
                    var point = {x: pos.x + h.x * xRatio + origin.x, y: pos.y + h.y * xRatio + origin.y};
                    if (does_contain(point,rectangle)) {

                        var pixels = ctx_src.getImageData(point.x + loc.x, point.y + loc.y, pixelsPerPoint, pixelsPerPoint).data;
                        var sum = 0, count = 0;
                        for(var i = 0; i < pixels.length; i += 4) { 
                          if(pixels[i + 3] === 0) continue; //Move on if transparent
                          var r = 255 - pixels[i];
                          var g = 255 - pixels[i + 1];
                          var b = 255 - pixels[i + 2];
                          var k = Math.min(r, g, b);
                          if(color.name !== 'k' && k === 255) sum += 0;
                          else if(color.name === 'k') sum += k / 255;
                          else if(color.name === 'c') sum += (r - k) / (255 - k);
                          else if(color.name === 'm') sum += (g - k) / (255 - k);
                          else if(color.name === 'y') sum += (b - k) / (255 - k);
                          count++;
                        }
                        if(count === 0) continue;
                        var rate = sum / count;
                        var radius = Math.SQRT1_2 * pixelsPerPoint * rate;

                        // var pixel = Math.round(point.y) * loc.width + Math.round(point.x);
                        // var dataIndex = pixel * 4;

                        // if(imageData.data[dataIndex + 3] === 0) continue;
                        // var pixelCMYK = rgb2cmyk(imageData.data[dataIndex], imageData.data[dataIndex + 1], imageData.data[dataIndex + 2]);
                        // var radius = pixelsPerPoint / 1.5 * pixelCMYK[color.name] / 100;

                        ctx_trg.beginPath();
                        ctx_trg.arc(point.x + loc.x, point.y + loc.y, radius, 0, 2 * Math.PI, false);
                        ctx_trg.fill();
                    }//if
                }//for x
            }//for y

        }//for c

    }//for p

    //})

    color_data.forEach(function(d,i) { 
        ctx_src.fillStyle = d.color;
        ctx_src.beginPath();
        ctx_src.arc(d.x, d.y, d.radius, 0, 2 * Math.PI, false);
        ctx_src.fill();
    })


}//function draw

//////////////////////////////////////////////////////////////
////////////////////// Helper functions //////////////////////
//////////////////////////////////////////////////////////////

// //From: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// function rgbToHex(r, g, b) {
//     return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
// }//function rgbToHex

function rgbToCMYK(rgb) {
    var r = rgb.r / 255,
        g = rgb.g / 255,
        b = rgb.b / 255,
        k = 1 - Math.max(r, g, b);

    return {
        cyan: (1 - r - k) / (1 - k),
        magenta: (1 - g - k) / (1 - k),
        yellow: (1 - b - k) / (1 - k),
        black: k
    };
}//function rgbToCMYK

function does_contain(point, rectangle) {
    return (point.x >= rectangle.x && point.x <= rectangle.x + rectangle.width && point.y >= rectangle.y && point.y <= rectangle.y + rectangle.height) ? true : false;
}

function rgb2cmyk(r, g, b) {
    var computedC = 0;
    var computedM = 0;
    var computedY = 0;
    var computedK = 0;

    //remove spaces from input RGB values, convert to int
    //var r = parseInt( (''+r).replace(/\s/g,''),10 );
    //var g = parseInt( (''+g).replace(/\s/g,''),10 );
    //var b = parseInt( (''+b).replace(/\s/g,''),10 );

    // BLACK
    if (r==0 && g==0 && b==0) {
        computedC = 1;
        computedM = 1;
        computedY = 1;
        computedK = 1;
    } else {
        computedC = 1 - (r/255);
        computedM = 1 - (g/255);
        computedY = 1 - (b/255);

        var minCMY = Math.min(computedC, Math.min(computedM,computedY));
        computedC = (computedC - minCMY) / (1 - minCMY) ;
        computedM = (computedM - minCMY) / (1 - minCMY) ;
        computedY = (computedY - minCMY) / (1 - minCMY) ;
        computedK = minCMY;
    }

    return {c:computedC * 100, m:computedM * 100, y:computedY * 100, k:computedK * 100};
}//function rgb2cmyk

/////////////////////// Retina non-blurry canvas ///////////////////////
function crispyCanvas(canvas, ctx, sf) {
    canvas
        .attr('width', sf * width)
        .attr('height', sf * height)
        .style('width', width + "px")
        .style('height', height + "px");
    ctx.scale(sf, sf);
}//function crispyCanvas