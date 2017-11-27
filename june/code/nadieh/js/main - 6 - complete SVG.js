var data_save;

// var data_new = []
// data_save.forEach(function(d) {
//     data_new.push({country_id: d.country_id, x: _.round(d.x,2), y: _.round(d.y,2)})
// })
// copy(data_new)

function create_CCS_chart() {
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
        .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

    var defs = chart.append("defs");

    //////////////////////////////////////////////////////////////
    //////////////// Initialize helpers and scales ///////////////
    //////////////////////////////////////////////////////////////

    var num_chapters = 50;
    var pi2 = 2*Math.PI;

    var rad_color = width * 0.4,
        rad_dot_color = width * 0.37,
        rad_donut_inner = width * 0.14,
        rad_donut_outer = width * 0.15,
        rad_name = rad_donut_outer + 8,
        rad_relation = rad_donut_inner - 8;

    //Angle for each chapter on the outside
    var angle = d3.scaleLinear()
        .domain([0, num_chapters])
        .range([0, 2 * Math.PI]);

    //Radius scale for the color circles
    var radius_scale = d3.scaleSqrt()
        .domain([0, 1])
        .range([0, 20]);

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Create groups ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    var cover_line_group = chart.append("g").attr("class", "cover-line-group");
    var chapter_line_group = chart.append("g").attr("class", "chapter-line-group");

    ///////////////////////////////////////////////////////////////////////////
    //////////////////////////// Read in the data /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    d3.queue()
        .defer(d3.json, "../../data/nadieh/ccs_character_per_chapter.json")
        .defer(d3.json, "../../data/nadieh/ccs_character_per_chapter_cover.json")
        .defer(d3.csv, "../../data/nadieh/ccs_character_total.csv")
        .defer(d3.csv, "../../data/nadieh/ccs_character_relations.csv")
        .defer(d3.json, "../../data/nadieh/ccs_color_distribution.json")
        .await(draw);

    function draw(error, character_data, cover_data, character_total_data, relation_data, color_data) {

        if (error) throw error;

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Final data prep /////////////////////////////
        ///////////////////////////////////////////////////////////////////////////

        character_total_data.forEach(function (d) {
            d.num_chapters = +d.num_chapters;
        })//forEach
        var character_names = character_total_data.map(function(d) { return d.character; })

        color_data.forEach(function (d) {
            d.cluster = d.chapter - 1;
            d.radius = radius_scale(d.percentage);

            //The center of gravity for this datapoint
            d.focusX = rad_color * Math.cos(angle(d.cluster) - Math.PI / 2);
            d.focusY = rad_color * Math.sin(angle(d.cluster) - Math.PI / 2);
            //Add a bit of random to not get weird placement behavior in the simulation
            d.x = d.focusX + Math.random();
            d.y = d.focusY + Math.random();
        })//forEach
        color_data = color_data.filter(function (d) { return d.chapter <= num_chapters; })

        //////////////////////////////////////////////////////////////
        ///////////////////// Create CMYK patterns ///////////////////
        //////////////////////////////////////////////////////////////

        //Patterns based on http://blockbuilder.org/veltman/50a350e86de82278ffb2df248499d3e2
        var radius_color_max = 1.75
        var radius_color = d3.scaleSqrt().range([0, radius_color_max]);

        var ccs_colors = color_data.map(function (d) { return d.color; }),
            cmyk_colors = ["yellow", "magenta", "cyan", "black"],
            rotation = [0, -15, 15, 45];

        //Loop over the different colors in the palette
        for (var j = 0; j < ccs_colors.length; j++) {
            //Get the radius transformations for this color
            var CMYK = rgbToCMYK(d3.rgb(ccs_colors[j]));

            //Create 4 patterns, C-Y-M-K, together forming the color
            defs.selectAll(".pattern-sub")
                .data(cmyk_colors)
                .enter().append("pattern")
                .attr("id", function (d) { return "pattern-sub-" + d + "-" + j; })
                .attr("patternUnits", "userSpaceOnUse")
                .attr("patternTransform", function (d, i) { return "rotate(" + rotation[i] + ")"; })
                .attr("width", 2 * radius_color_max)
                .attr("height", 2 * radius_color_max)
                .append("circle")
                .attr("fill", Object)
                .attr("cx", radius_color_max)
                .attr("cy", radius_color_max)
                .attr("r", function (d) { return radius_color(CMYK[d]); });

            //Nest the CMYK patterns into a larger pattern
            defs.append("pattern")
                .attr("id", "pattern-total-" + j)
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", radius_color_max * 31)
                .attr("height", radius_color_max * 31)
                .selectAll(".dots")
                .data(cmyk_colors)
                .enter().append("rect")
                .attr("class", "dots")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0)
                .style("mix-blend-mode", "multiply")
                .attr("fill", function (d, i) { return "url(#pattern-sub-" + cmyk_colors[i] + "-" + j + ")"; })
        }//for j

        // //Adding images of the characters
        // var image_radius = 30;
        // var image_group = defs.append("g").attr("class", "image-group");
        // //Had to add img width otherwise it wouldn't work in Safari & Firefox
        // //http://stackoverflow.com/questions/36390962/svg-image-tag-not-working-in-safari-and-firefox
        // image_group.selectAll(".circle-image")
        //     .data(character_names)
        //     .enter().append("pattern")
        //     .attr("id", function (d) { return "circle-image-" + d.toLowerCase(); })
        //     .attr("class", "circle-image")
        //     .attr("patternUnits", "objectBoundingBox")
        //     .attr("height", "100%")
        //     .attr("width", "100%")
        //     .append("image")
        //     .attr("xlink:href", function (d) { return "img/" + d.toLowerCase() + ".png"; })
        //     .attr("height", 2 * image_radius)
        //     .attr("width", 2 * image_radius);

        ///////////////////////////////////////////////////////////////////////////
        /////////////////////////// Run force simulation //////////////////////////
        ///////////////////////////////////////////////////////////////////////////     

        var simulation = d3.forceSimulation(color_data)
            .force("x", d3.forceX().x(function (d) { return d.focusX; }).strength(0.05))
            .force("y", d3.forceY().y(function (d) { return d.focusY; }).strength(0.05))
            .force("collide", d3.forceCollide(function (d) { return d.radius * 1 + 2; }).strength(0))
            .on("tick", tick)
            .on("end", simulation_end)
            .alphaMin(.1)
        //.stop();

        //Run the simulation "manually"
        //for (var i = 0; i < 300; ++i) simulation.tick();

        //Ramp up collision strength to provide smooth transition
        var t = d3.timer(function (elapsed) {
            var dt = elapsed / 3000;
            simulation.force("collide").strength(Math.pow(dt, 2) * 0.7);
            if (dt >= 1.0) t.stop();
        });

        function tick(e) {
            color_circle
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
        }//function tick

        //When the simulation is done, run this function
        function simulation_end() {
            //Create the CMYK halftones
            color_circle.style("fill", function (d, i) { return "url(#pattern-total-" + i + ")"; })

            //Create the cover lines
            create_lines(cover_lines)
            //Create a loop t0 slowly show the cover lines
            var loop_lines,
                counter = 0; 
            //Take Sonomi and Kaho out who have no chapter cover
            var character_names_cover =  character_names.filter(function(d) { return d !== "Sonomi" && d !== "Kaho"; });
            setTimeout(function() {
                loop_lines = setInterval(function() {
                    cover_lines.filter(function(d,i) { return d.character === character_names_cover[counter]; })
                        .style("opacity", 0.2)
                    counter += 1;
                    //When all is drawn, break loop and draw the chapter lines
                    if(counter >= character_names_cover.length) {
                        clearInterval(loop_lines);
                        //Create the chapter lines
                        setTimeout(function() { create_lines(chapter_lines); }, 300);
                    }//if
                }, 300);
            },500);
    
        }//function simulation_end

        // //Dragging functions for final positioning adjustments
        // function dragstarted(d) {
        //     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        //     d.fx = d.x;
        //     d.fy = d.y;
        // }//function dragstarted

        // function dragged(d) {
        //     d.fx = d3.event.x;
        //     d.fy = d3.event.y;
        // }//function dragged

        // function dragended(d) {
        //     if (!d3.event.active) simulation.alphaTarget(0);
        //     d.fx = null;
        //     d.fy = null;
        // }//function dragended

        data_save = color_data; //So I save the final positions

        ///////////////////////////////////////////////////////////////////////////
        /////////////////////////// Create color circles //////////////////////////
        ///////////////////////////////////////////////////////////////////////////    

        var color_group = chart.append("g").attr("class", "color-group");
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
            // .call(d3.drag()
            //     .on('start', dragstarted)
            //     .on('drag', dragged)
            //     .on('end', dragended)
            // );

        ///////////////////////////////////////////////////////////////////////////
        //////////////////////////// Create donut shapes //////////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        //Arc command for the inner donut shape
        var arc = d3.arc()
            .outerRadius(rad_donut_outer)
            .innerRadius(rad_donut_inner)
            .padAngle(0.01)
            .cornerRadius((rad_donut_outer - rad_donut_inner) / 2 * 1)
        //Pie function to calculate sizes of donut slices
        var pie = d3.pie()
            .sort(null)
            .value(function (d) { return d.num_chapters; });

        var arcs = pie(character_total_data);

        //Create the donut slices per character (and the number of chapters they appeared in)
        var donut_group = chart.append("g").attr("class", "donut-group");
        var slice = donut_group.selectAll(".arc")
            .data(arcs)
            .enter().append("path")
            .attr("class", "arc")
            .attr("d", arc)
            .style("fill", function (d) { return d.data.color; });

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Create name labels //////////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var name_group = chart.append("g").attr("class", "name-group");

        //Create a group per character
        var names = name_group.selectAll(".name")
            .data(arcs)
            .enter().append("g")
            .attr("class", "name")
            .each(function (d, i) {
                d.centerAngle = (d.endAngle - d.startAngle) / 2 + d.startAngle;
            })
            .style("text-anchor", function (d) { return d.centerAngle > 0 & d.centerAngle < Math.PI ? "start" : "end";; })
            .style("font-family", "Anime Ace")
            
        //Add the big "main" name
        names.append("text")
            .attr("class", "name-label")
            .attr("id", function (d, i) { return "name-label-" + i; })
            .attr("dy", ".35em")
            .attr("transform", function (d, i) {
                //If there is a last name, move the first a bit upward
                if(character_total_data[i].last_name !== "") {
                    var finalAngle = d.centerAngle + (d.centerAngle > 0 & d.centerAngle < Math.PI ? -0.02 : 0.02);
                } else {
                    var finalAngle = d.centerAngle;
                }//else
                return "rotate(" + (finalAngle * 180 / Math.PI - 90) + ")"
                    + "translate(" + rad_name + ")"
                    + (finalAngle > 0 & finalAngle < Math.PI ? "" : "rotate(180)");
            })
            .text(function (d, i) { return character_total_data[i].first_name; });

        //Add the smaller last name (if available) below
        names.append("text")
            .attr("class", "last-name-label")
            .attr("id", function (d, i) { return "last-name-label-" + i; })
            .attr("dy", ".35em")
            .attr("transform", function (d, i) {
                //If there is a last name, move the last a bit downward
                if(character_total_data[i].last_name !== "") {
                    var finalAngle = d.centerAngle + (d.centerAngle > 0 & d.centerAngle < Math.PI ? 0.03 : -0.03);
                } else {
                    var finalAngle = d.centerAngle;
                }//else
                return "rotate(" + (finalAngle * 180 / Math.PI - 90) + ")"
                    + "translate(" + rad_name + ")"
                    + (finalAngle > 0 & finalAngle < Math.PI ? "" : "rotate(180)");
            })
            .text(function (d, i) { return character_total_data[i].last_name; });

        //Add one more line for the classmates label
        names.filter(function(d,i) { return i === arcs.length - 1; })
            .append("text")
            .attr("class", "last-name-label")
            .attr("dy", ".35em")
            .attr("y", "1.35em")
            .attr("transform", function (d, i) {
                var finalAngle = (d.endAngle - d.startAngle) / 2 + d.startAngle - 0.03;
                return "rotate(" + (finalAngle * 180 / Math.PI - 90) + ")"
                    + "translate(" + rad_name + ")rotate(180)";
            })
            .text("Rika, Yamazaki");

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Create name dots ////////////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var characterByName = [];
        //Color of the dot behind the name can be the type
        character_total_data.forEach(function (d, i) {
            var text_width_first = document.getElementById('name-label-' + i).getComputedTextLength();
            var text_width_last = document.getElementById('last-name-label-' + i).getComputedTextLength();
            d.dot_name_rad = rad_name + Math.max(text_width_first,text_width_last) + 10;
            d.name_angle = (arcs[i].endAngle - arcs[i].startAngle) / 2 + arcs[i].startAngle;

            characterByName[d.character] = d;
        })//forEach

        //Add a circle at the end of each name of each character
        var name_dot_group = chart.append("g").attr("class", "name-dot-group");
        name_dot_group.selectAll(".type-dot")
            .data(character_total_data)
            .enter().append("circle")
            .attr("class", "type-dot")
            .attr("cx", function (d) { return d.dot_name_rad * Math.cos(d.name_angle - Math.PI / 2); })
            .attr("cy", function (d) { return d.dot_name_rad * Math.sin(d.name_angle - Math.PI / 2); })
            .attr("r", 6)
            .style("fill", function (d) { return d.color; })
            .style("stroke", "white")
            .style("stroke-width", 3)
            //Old version with image inside the circle
            // .style("fill", function(d) { return "url(#circle-image-" + d.character.toLowerCase() + ")"; })
            // .style("stroke-width", 4);


        //TODO: mark something about the type: magical, human, etc
        //var color_type = d3.scaleOrdinal() `

        ///////////////////////////////////////////////////////////////////////////
        ////////////////////////// Create inner relations /////////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var pull_scale = d3.scaleLinear()
            .domain([2*rad_relation, 0])
            .range([0.7, 2.3]);
        var color_relation = d3.scaleOrdinal()
            .domain(["family","crush","love","friend","master"]) //"teacher","ex-lovers","reincarnation","rival"
            .range(["#2C9AC6","#FA88A8","#E01A25","#7EB852","#F6B42B"])
            .unknown("#d4d4d4");
        var stroke_relation = d3.scaleOrdinal()
            .domain(["family","crush","love","friend","master"]) //"teacher","ex-lovers","reincarnation","rival"
            .range([4,5,8,4,5])
            .unknown(3);

        var relation_group = chart.append("g").attr("class", "relation-group");

        //Create the lines in between the characters that have some sort of relation
        relation_group.selectAll(".relation-path")
            .data(relation_data)
            .enter().append("path")
            .attr("class", "relation-path")
            .style("fill", "none")
            .style("stroke", function(d) { return color_relation(d.type); })
            .style("stroke-width", function(d) {return stroke_relation(d.type); })
            .style("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .style("opacity", 0.7)
            .attr("d", function(d) { 
                var source_a = characterByName[d.source].name_angle,
                    target_a = characterByName[d.target].name_angle;
                var x1 = rad_relation * Math.cos(source_a - Math.PI/2),
                    y1 = rad_relation * Math.sin(source_a - Math.PI/2),
                    x2 = rad_relation * Math.cos(target_a - Math.PI/2),
                    y2 = rad_relation * Math.sin(target_a - Math.PI/2);
                var dx = x2 - x1,
                    dy = y2 - y1,
                    dr = Math.sqrt(dx * dx + dy * dy);
                var curve = dr * 1/pull_scale(dr);

                //Get the angles to determine the optimum sweep flag
                var delta_angle = (target_a - source_a) / Math.PI;
                var sweep_flag = 0;
                if ((delta_angle > -1 && delta_angle <= 0) || (delta_angle > 1 && delta_angle <= 2)) 
                    sweep_flag = 1;

                return "M" + x1 + "," + y1 + " A" + curve + "," + curve + " 0 0 " + sweep_flag + " " + x2 + "," + y2;
             });

        ///////////////////////////////////////////////////////////////////////////
        //////////////////// Create dots for each chapter groups //////////////////
        /////////////////////////////////////////////////////////////////////////// 

        //Add a circle at the inside of each chapter
        var color_dot_group = chart.append("g").attr("class", "color-dot-group");
        color_dot_group.selectAll(".color-dot")
            .data(d3.range(num_chapters))
            .enter().append("circle")
            .attr("class", "color-dot")
            .attr("cx", function (d) { return rad_dot_color * Math.cos(angle(d) - Math.PI / 2); })
            .attr("cy", function (d) { return rad_dot_color * Math.sin(angle(d) - Math.PI / 2); })
            .attr("r", 4)
            .style("fill", "#c4c4c4")
            .style("stroke", "white")
            .style("stroke-width", 2);

        ///////////////////////////////////////////////////////////////////////////
        ////////////////// Create lines from character to chapters ////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var chapter_lines = chapter_line_group.selectAll(".chapter-line")
            .data(character_data.filter(function (d) { return d.chapter <= num_chapters; }))
            .enter().append("path")
            .attr("class", "chapter-line")
            .style("fill", function(d) { return characterByName[d.character].color; })
            .style("opacity", 0)
            .style("mix-blend-mode", "multiply");

        ///////////////////////////////////////////////////////////////////////////
        ////////////////// Create lines from character to chapters ////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var cover_lines = cover_line_group.selectAll(".cover-line")
            .data(cover_data.filter(function (d) { return d.chapter <= num_chapters; }))
            .enter().append("path")
            .attr("class", "cover-line")
            .style("fill", function(d) { return characterByName[d.character].color; })
            .style("opacity", 0)
            .style("mix-blend-mode", "multiply");

        function create_lines(selection) {
            selection.attr("d", function(d) {
                // console.log(d)
                var source_a = characterByName[d.character].name_angle,
                    source_r = characterByName[d.character].dot_name_rad
                    target_a = angle(d.chapter-1);
                var xs = source_r * Math.cos(source_a - Math.PI/2),
                    ys = source_r * Math.sin(source_a - Math.PI/2),
                    xt = rad_dot_color * Math.cos(target_a - Math.PI/2),
                    yt = rad_dot_color * Math.sin(target_a - Math.PI/2);
                var dx = xt - xs,
                    dy = yt - ys;
                
                //Where should the middle point be placed
                var scale_middle_a = d3.scaleLinear()
                     .domain([0, 0.9])
                     .range([0.5, 0.84])
                     .clamp(true);           
                if(target_a - source_a < -Math.PI) {
                    var side = "cw";
                    var da = 2 + (target_a - source_a)/Math.PI;
                    var angle_sign = 1;
                    var middle_a = ((2 * Math.PI + target_a) - source_a) * scale_middle_a(da) + source_a; 
                } else if(target_a - source_a < 0) {
                    var side = "ccw";
                    var da = (source_a - target_a)/Math.PI;
                    var angle_sign = -1; 
                    var middle_a = (source_a - target_a) * (1 - scale_middle_a(da)) + target_a;
                } else if(target_a - source_a < Math.PI) { 
                    var side = "cw";
                    var da = (target_a - source_a)/Math.PI;
                    var angle_sign = 1;
                    var middle_a = (target_a - source_a) * scale_middle_a(da) + source_a; 
                } else { 
                    var side = "ccw";
                    var da = 2 - (target_a - source_a)/Math.PI;
                    var angle_sign = -1;
                    var middle_a = ((source_a + 2 * Math.PI) - target_a) * (1 - scale_middle_a(da)) + target_a;
                }//else
                middle_a = middle_a % pi2;
                var ma = middle_a/Math.PI;

                //Set up the first anchor point
                var scale_source_width = d3.scaleLinear()
                    .domain([0,1])
                    .range([0.001,0.02]);
                var source_width = scale_source_width(da);
                //Anchor point connected to source location
                var scale_angle_start_offset = d3.scaleLinear()
                    .domain([0,0.7])
                    .range([0,0.1]);
                var start_angle_offset = scale_angle_start_offset(da);
                start_angle_offset -= source_width;
                var scale_start_rad_offset = d3.scaleLinear()
                    .domain([0,1])
                    .range([10,300]);
                var start_rad_offset = scale_start_rad_offset(da);
                var cx1 = (source_r + start_rad_offset) * Math.cos(source_a + angle_sign * start_angle_offset * Math.PI - Math.PI/2),
                    cy1 = (source_r + start_rad_offset) * Math.sin(source_a + angle_sign * start_angle_offset * Math.PI - Math.PI/2);


                //Calculate the radius of the middle point of the line
                var scale_rad_middle = d3.scaleLinear()
                    .domain([0, 1])
                    .range([0.26, 0.33]);
                var rad_middle_line = scale_rad_middle(da) * width;
                var scale_rad_width = d3.scaleLinear()
                    .domain([0, 1])
                    .range([4, 4]);
                var rad_width = scale_rad_width(da);
                rad_middle_line += rad_width;
                //Location of the "middle" point
                var xm = rad_middle_line * Math.cos(middle_a - Math.PI/2),
                    ym = rad_middle_line * Math.sin(middle_a - Math.PI/2);
                    

                //Find the slope/angle of the tangent line to the circle of the middle point
                var slope = -1 * xm/ym,
                    tangent_a = Math.abs(Math.atan(slope));

                //Slightly offset the actual anchor points from the tangent line
                //Depending on how far from the source the middle point lies
                var sign_offset;
                //Get the signs of the middle two anchor points
                //It depends on the "quadrant" of the circle the middle point lies in
                //And whether the line is drawn clockwise or counterclockwise
                var sign_x, sign_y;
                //Side = cw
                if(ma >= 0 && ma < 0.5) {
                    sign_offset = 1;
                    sign_x = -1;
                    sign_y = -1;
                } else if (ma >= 0.5 && ma < 1) {
                    sign_offset = -1;
                    sign_x = 1;
                    sign_y = -1;
                } else if (ma >= 1 && ma < 1.5) {
                    sign_offset = 1;
                    sign_x = 1;
                    sign_y = 1;
                } else if (ma >= 1.5 && ma <= 2) {
                    sign_offset = -1;
                    sign_x = -1;
                    sign_y = 1;
                }//else if
                //Inverse for counterclockwise
                if(side === "ccw") {
                    sign_offset *= -1;
                    sign_x *= -1;
                    sign_y *= -1;
                }//if

                var scale_middle_angle_offset = d3.scaleLinear()
                    .domain([0,0.4,0.5,1])
                    .range([-0.4,0,0.05,0])
                    .clamp(true);
                var middle_angle_offset = sign_offset * scale_middle_angle_offset(da);
                //First anchor to middle
                var scale_first_anchor = d3.scaleLinear()
                    .domain([0,0.2,1])
                    .range([20,50,600]);
                var first_anchor_offset = scale_first_anchor(da);
                var cx2 = xm + sign_x * first_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy2 = ym + sign_y * first_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);
                //Second anchor to middle
                var scale_second_anchor = d3.scaleLinear()
                    .domain([0,1])
                    .range([20,120]);
                var second_anchor_offset = scale_second_anchor(da);
                var cx3 = xm - sign_x * second_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy3 = ym - sign_y * second_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);


                //Anchor point connected to target location
                var scale_end_offset = d3.scaleLinear()
                    .domain([0,1])
                    .range([0,0.03]);
                var scale_end_rad_offset = d3.scaleLinear()
                    .domain([0,1])
                    .range([50,30]);
                var end_rad_offset = scale_end_rad_offset(da);
                var end_angle_offset = scale_end_offset(da);
                end_angle_offset += 0.002;
                var cx4 = (rad_dot_color - end_rad_offset) * Math.cos(target_a - angle_sign * end_angle_offset * Math.PI - Math.PI/2),
                    cy4 = (rad_dot_color - end_rad_offset) * Math.sin(target_a - angle_sign * end_angle_offset * Math.PI - Math.PI/2);

                // //Draw the anchor points for reference
                // chart.append("circle")
                //     .attr("cx", cx1).attr("cy", cy1)
                //     .attr("r", 3).style("fill", "blue")
                // chart.append("circle")
                //     .attr("cx", cx2).attr("cy", cy2)
                //     .attr("r", 3).style("fill", "green")
                // chart.append("circle")
                //     .attr("cx", xm).attr("cy", ym)
                //     .attr("r", 3).style("fill", "red")
                // chart.append("circle")
                //     .attr("cx", cx3).attr("cy", cy3)
                //     .attr("r", 3).style("fill", "orange")
                // chart.append("circle")
                //     .attr("cx", cx4).attr("cy", cy4)
                //     .attr("r", 3).style("fill", "blue")
                
                //Set up the path from source to target
                var path = "M" + xs + "," + ys;
                if(da/Math.PI > 0.02) {
                    path += " C" + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + xm + "," + ym;
                    path += " C" + cx3 + "," + cy3 + " " + cx4 + "," + cy4 + " " + xt + "," + yt;
                } else {
                    path += " C" + cx1 + "," + cy1 + " " + cx4 + "," + cy4 + " " + xt + "," + yt;
                }//else


                //Create the portion back to create the tapered stroke
                start_angle_offset += 2*source_width;
                var cx1b = (source_r + start_rad_offset) * Math.cos(source_a + angle_sign * start_angle_offset * Math.PI - Math.PI/2),
                    cy1b = (source_r + start_rad_offset) * Math.sin(source_a + angle_sign * start_angle_offset * Math.PI - Math.PI/2);

                rad_middle_line -= 2*rad_width;
                //Location of the "middle" point
                var xmb = rad_middle_line * Math.cos(middle_a - Math.PI / 2),
                    ymb = rad_middle_line * Math.sin(middle_a - Math.PI / 2);
                middle_angle_offset += 0.01;
                //First anchor to middle
                var cx2b = xmb + sign_x * first_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy2b = ymb + sign_y * first_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);
                //Second anchor to middle
                var cx3b = xmb - sign_x * second_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy3b = ymb - sign_y * second_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);

                end_angle_offset -= 0.004;
                var cx4b = (rad_dot_color - end_rad_offset) * Math.cos(target_a - angle_sign * end_angle_offset * Math.PI - Math.PI/2),
                    cy4b = (rad_dot_color - end_rad_offset) * Math.sin(target_a - angle_sign * end_angle_offset * Math.PI - Math.PI/2);

                if(da/Math.PI > 0.02) {
                    path += " C" + cx4b + "," + cy4b + " " + cx3b + "," + cy3b + " " + xmb + "," + ymb;
                    path += " C" + cx2b + "," + cy2b + " " + cx1b + "," + cy1b + " " + xs + "," + ys;
                } else {
                    path += " C" + cx4b + "," + cy4b + " " + cx1b + "," + cy1b + " " + xs + "," + ys;
                }//else           

                // chart.append("circle")
                //     .attr("cx", cx1b).attr("cy", cy1b)
                //     .attr("r", 3).style("fill", "blue").style("opacity", 0.5)
                // chart.append("circle")
                //     .attr("cx", cx2b).attr("cy", cy2b)
                //     .attr("r", 3).style("fill", "green").style("opacity", 0.5)
                // chart.append("circle")
                //     .attr("cx", xmb).attr("cy", ymb)
                //     .attr("r", 3).style("fill", "red").style("opacity", 0.5)
                // chart.append("circle")
                //     .attr("cx", cx3b).attr("cy", cy3b)
                //     .attr("r", 3).style("fill", "orange").style("opacity", 0.5)
                // chart.append("circle")
                //     .attr("cx", cx4b).attr("cy", cy4b)
                //     .attr("r", 3).style("fill", "blue").style("opacity", 0.5)

                return path;

            })//attr d

        }//function create_lines

            
            

    }//function draw

}//function create_CCS_chart

//////////////////////////////////////////////////////////////
////////////////////// Helper functions //////////////////////
//////////////////////////////////////////////////////////////

//Turn RGB into CMYK "circle radii"
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