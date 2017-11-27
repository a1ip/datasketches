var data_save;

// var data_new = []
// data_save.forEach(function(d) {
//     data_new.push({country_id: d.country_id, x: _.round(d.x,2), y: _.round(d.y,2)})
// })
// copy(data_new)

////////////////////////////////////////////////////////////// 
//////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////// 

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
};
var width = 1600 - margin.left - margin.right;
var height = 1600 - margin.top - margin.bottom;

//SVG container
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var chart = svg.append("g")
    .attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");

var defs = chart.append("defs");

//////////////////////////////////////////////////////////////
//////////////// Initialize helpers and scales ///////////////
//////////////////////////////////////////////////////////////

var num_chapters = 50;

var angle = d3.scaleLinear()
    .domain([0, num_chapters])
    .range([0, 2*Math.PI]); 

var radius_scale = d3.scaleSqrt()
    .domain([0, 1])
    .range([0, 20]); 

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
        d.x = rad * Math.cos(angle(d.cluster) - Math.PI/2);
        d.y = rad * Math.sin(angle(d.cluster) - Math.PI/2);

        if (!clusters[d.cluster] || (d.radius > clusters[d.cluster].radius)) clusters[d.cluster] = d;

    })//forEach
    color_data = color_data.filter(function(d) { return d.chapter <= num_chapters; })

    //////////////////////////////////////////////////////////////
    //////////////////// Create def components ///////////////////
    //////////////////////////////////////////////////////////////

    //Patterns based on http://blockbuilder.org/veltman/50a350e86de82278ffb2df248499d3e2
    var radius_color_max = 1.75
    var radius_color = d3.scaleSqrt().range([0, radius_color_max]);

    var ccs_colors = color_data.map(function(d) { return d.color; }),
        colors = ["yellow", "magenta", "cyan", "black"],
        rotation = [0, -15, 15, 45];

    //Loop over the different colors in the palette
    for(var j = 0; j < ccs_colors.length; j++) {
        //Get the radius transformations for this color
        var CMYK = rgbToCMYK(d3.rgb(ccs_colors[j]));

        //Create 4 patterns, C-Y-M-K, together forming the color
        defs.selectAll(".pattern-sub")
            .data(colors)
            .enter().append("pattern")
            .attr("id", function(d) { return "pattern-sub-" + d + "-" + j; })
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", function(d,i) { return "rotate(" + rotation[i] + ")"; })
            .attr("width", 2*radius_color_max)
            .attr("height", 2*radius_color_max)
            .append("circle")
            .attr("fill", Object)
            .attr("cx", radius_color_max)
            .attr("cy", radius_color_max)
            .attr("r", function(d) { return radius_color(CMYK[d]); });

        //Nest the CMYK patterns into a larger pattern
        defs.append("pattern")
            .attr("id", "pattern-total-" + j)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", radius_color_max*31)
            .attr("height", radius_color_max*31)
        .selectAll(".dots")
            .data(colors)
            .enter().append("rect")
            .attr("class", "dots")
            .attr("width", width )
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0)
            .style("mix-blend-mode", "multiply")
            .attr("fill", function(d,i) { return "url(#pattern-sub-" + colors[i] + "-" + j + ")"; })
    }//for j

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Run force simulation //////////////////////////
    ///////////////////////////////////////////////////////////////////////////     

    var simulation = d3.forceSimulation(color_data)
        .force("center", d3.forceCenter(0,0))
        .force("cluster", d3.forceCluster()
            .centers(function(d) { return clusters[d.cluster]; })
            .strength(0.8)
            .centerInertia(0.1))
        .force("collide", d3.forceCollide(function(d) { return d.radius*1 + 2; }).strength(0.7))
        //.stop();
        .on("tick", tick)
        .on("end", cmyk_halftone)
        .alphaMin(.1);

    //Run the simulation "manually"
    //for (var i = 0; i < 300; ++i) simulation.tick();

    //Ramp up collision strength to provide smooth transition
    var transitionTime = 3000;
    var t = d3.timer(function (elapsed) {
        var dt = elapsed / transitionTime;
        simulation.force("collide").strength(Math.pow(dt, 2) * 0.7);
        if (dt >= 1.0) t.stop();
    });

    function tick(e) {
        color_circle
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
    }//function tick

    //When the first simulation is done, fill with the hatched pattern
    function cmyk_halftone() {
        color_circle.style("fill", function(d,i) { return "url(#pattern-total-" + i + ")"; })
    }//function cmyk_halftone

    //Dragging functions for final positioning adjustments
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }//function dragstarted

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }//function dragged

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }//function dragended

    data_save = color_data; //So I save the final positions

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Create color circles //////////////////////////
    ///////////////////////////////////////////////////////////////////////////    

    var color_group = chart.append("g").attr("class","color-group");
    var color_circle = color_group.selectAll(".color-circle")
        .data(color_data)
        .enter().append("circle")
        .attr("class", "color-circle")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", function (d) { return d.radius; })
        .style("fill", function (d) { return d.color; })
        .style("stroke", function (d) { return d.color; })
        .style("stroke-width", 3)
        //.style("mix-blend-mode", "multiply")
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
        );

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