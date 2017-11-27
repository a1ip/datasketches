//TODO: mark something about the type: magical, human, etc
//var color_type = d3.scaleOrdinal()
//TODO: Add chapter cover on chapter hover
//TODO: Add legends
//TODO: Add intro + credit
//TODO: Add annotations


var data_save;

// var data_new = []
// data_save.forEach(function(d) {
//     data_new.push({country_id: d.country_id, x: _.round(d.x,2), y: _.round(d.y,2)})
// })
// copy(data_new)

function create_CCS_chart() {
    ////////////////////////////////////////////////////////////// 
    //////////////////// Create SVG & Canvas /////////////////////
    ////////////////////////////////////////////////////////////// 
    
    var container = d3.select("#chart");
    var width = 1400;
    var height = width;

    var size_factor = width/1600;

    //Canvas
    var canvas = container.append("canvas").attr("id", "canvas-target")
    var ctx = canvas.node().getContext("2d");
    crispyCanvas(canvas, ctx, 2);
    ctx.translate(width/2,height/2);

    //SVG container
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    var chart = svg.append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    var defs = chart.append("defs");

    //////////////////////////////////////////////////////////////
    //////////////// Initialize helpers and scales ///////////////
    //////////////////////////////////////////////////////////////

    var num_chapters = 50;
    var pi2 = 2*Math.PI,
        pi1_2 = Math.PI/2;

    var color_sakura = "#EB5580",
        color_kero = "#F6B42B";

    var rad_card_label = 0.435 * width, //capture card text on the outside
        rad_color_outer = width * 0.42, //outside of the hidden chapter hover
        rad_volume_donut_inner = width * 0.425, //inner radius of the volume donut
        rad_volume_donut_outer = width * 0.427, //outer radius of the volume donut
        rad_color = width * 0.39, //color circles
        rad_dot_color = width * 0.34, //chapter dot
        rad_chapter_donut_inner = width * 0.34, //inner radius of the chapter donut
        rad_chapter_donut_outer = width * 0.354, //outer radius of the chapter donut
        rad_line_label = width * 0.255, //textual label that explains the hovers
        rad_donut_inner = width * 0.14, //inner radius of the character donut
        rad_donut_outer = width * 0.15, //outer radius of the character donut
        rad_name = rad_donut_outer + 8 * size_factor, //padding between character donut and start of the character name
        rad_relation = rad_donut_inner - 8 * size_factor; //padding between character donut and inner lines

    //Angle for each chapter on the outside
    var angle = d3.scaleLinear()
        .domain([0, num_chapters])
        .range([pi2/num_chapters/2, pi2 + pi2/num_chapters/2]);

    //Radius scale for the color circles
    var radius_scale = d3.scaleSqrt()
        .domain([0, 1])
        .range([0, 20]);

    var simulation;

    var remove_text_timer;

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Create groups ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////
    //////////////////////////// Read in the data /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    d3.queue()
        .defer(d3.json, "../../data/nadieh/ccs_chapter_hierarchy.json")
        .defer(d3.json, "../../data/nadieh/ccs_chapter_total.json")
        .defer(d3.json, "../../data/nadieh/ccs_character_per_chapter.json")
        .defer(d3.json, "../../data/nadieh/ccs_character_per_chapter_cover.json")
        .defer(d3.csv, "../../data/nadieh/ccs_character_total.csv")
        .defer(d3.csv, "../../data/nadieh/ccs_character_relations.csv")
        .defer(d3.json, "../../data/nadieh/ccs_color_distribution.json")
        .await(draw);

    function draw(error, chapter_hierarchy_data, chapter_total_data, character_data, cover_data, character_total_data, relation_data, color_data) {

        if (error) throw error;

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////// Calculate chapter loactions //////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var root = d3.stratify()
            .id(function (d) { return d.name; })
            .parentId(function (d) { return d.parent; })
            (chapter_hierarchy_data);
        var cluster = d3.cluster()
            .size([360, rad_dot_color])
            .separation(function separation(a, b) {
                return a.parent == b.parent ? 1 : 1.2;
            });
        cluster(root);
        var chapter_location_data = root.leaves()
        chapter_location_data.forEach(function (d, i) {
            d.centerAngle = d.x * Math.PI / 180;
        });

        //The distance between two chapters that belong to the same volume
        var chapter_angle_distance = chapter_location_data[1].centerAngle - chapter_location_data[0].centerAngle;

        chapter_location_data.forEach(function (d, i) {
            d.startAngle = d.centerAngle - chapter_angle_distance / 2;
            d.endAngle = d.centerAngle + chapter_angle_distance / 2;
        })

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////////// Final data prep /////////////////////////////
        ///////////////////////////////////////////////////////////////////////////

        character_total_data.forEach(function (d) {
            d.num_chapters = +d.num_chapters;
        })//forEach
        var character_names = character_total_data.map(function(d) { return d.character; });

        //Sort cover data according to characters from total
        function sortCharacter(a, b) { return character_names.indexOf(a.character) - character_names.indexOf(b.character); }
        cover_data.sort(sortCharacter);
        character_data.sort(sortCharacter);

        color_data.forEach(function (d) {
            d.cluster = d.chapter - 1;
            d.radius = radius_scale(d.percentage);

            //The center of gravity for this datapoint
            d.focusX = rad_color * Math.cos(chapter_location_data[d.cluster].centerAngle - pi1_2);
            d.focusY = rad_color * Math.sin(chapter_location_data[d.cluster].centerAngle - pi1_2);
            //Add a bit of random to not get weird placement behavior in the simulation
            d.x = d.focusX + Math.random();
            d.y = d.focusY + Math.random();
        })//forEach
        color_data = color_data.filter(function (d) { return d.chapter <= num_chapters; })

        //////////////////////////////////////////////////////////////
        ///////////////////// Create CMYK patterns ///////////////////
        //////////////////////////////////////////////////////////////

        //Patterns based on http://blockbuilder.org/veltman/50a350e86de82278ffb2df248499d3e2
        var radius_color_max = 1.75;
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

        ///////////////////////////////////////////////////////////////////////////
        /////////////////////////// Run force simulation //////////////////////////
        ///////////////////////////////////////////////////////////////////////////     

        simulation = d3.forceSimulation(color_data)
            .force("x", d3.forceX().x(function (d) { return d.focusX; }).strength(0.05))
            .force("y", d3.forceY().y(function (d) { return d.focusY; }).strength(0.05))
            .force("collide", d3.forceCollide(function (d) { return (d.radius * 1 + 2) * size_factor; }).strength(0))
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

            //Place the mouse hover events
            character_hover
                .on("mouseover", mouse_over_character)
                .on("mouseout", mouse_out_character);
            chapter_hover
                .on("mouseover", mouse_over_chapter)
                .on("mouseout", mouse_out_chapter);
    
        }//function simulation_end

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
            .attr("r", function (d) { return d.radius * size_factor; })
            .style("fill", function (d) { return d.color; })
            .style("stroke", function (d) { return d.color; })
            .style("stroke-width", 3 * size_factor)
            // .call(d3.drag()
            //     .on('start', dragstarted)
            //     .on('drag', dragged)
            //     .on('end', dragended)
            // );

        ///////////////////////////////////////////////////////////////////////////
        /////////////////////// Create character donut chart //////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        //Arc command for the character donut chart
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
        arcs.forEach(function(d,i) {
            d.character = character_total_data[i].character;
            d.centerAngle = (d.endAngle - d.startAngle) / 2 + d.startAngle;
        });

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
            .style("font-size", (12*size_factor)+"px")
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
            .style("font-size", (9*size_factor)+"px")
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
            .style("font-size", (9*size_factor)+"px")
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
        var name_dot = name_dot_group.selectAll(".type-dot")
            .data(character_total_data)
            .enter().append("circle")
            .attr("class", "type-dot")
            .attr("cx", function (d) { return d.dot_name_rad * Math.cos(d.name_angle - pi1_2); })
            .attr("cy", function (d) { return d.dot_name_rad * Math.sin(d.name_angle - pi1_2); })
            .attr("r", 6 * size_factor)
            .style("fill", function (d) { return d.color; })
            .style("stroke", "white")
            .style("stroke-width", 3 * size_factor)

        ///////////////////////////////////////////////////////////////////////////
        ////////////////////// Create hidden name hover areas /////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var arc_character_hover = d3.arc()
            .outerRadius(function(d,i) { return character_total_data[i].dot_name_rad; })
            .innerRadius(rad_donut_inner)

        //Create the donut slices per character (and the number of chapters they appeared in)
        var character_hover_group = chart.append("g").attr("class", "character-hover-group");
        var character_hover = character_hover_group.selectAll(".character-hover-arc")
            .data(arcs)
            .enter().append("path")
            .attr("class", "character-hover-arc")
            .attr("d", arc_character_hover)
            .style("fill", "none")
            .style("pointer-events", "all");

        function mouse_over_character(d) {
            //Show the chosen lines
            ctx.clearRect(-width/2, -height/2, width, height);
            ctx.globalAlpha = 0.4;
            create_lines(character_data.filter(function(c,j) {return c.character === d.character; }) );

            //Update label path
            line_label_path.attr("d", label_arc(characterByName[d.character].name_angle));
            //Update the label text
            clearTimeout(remove_text_timer);
            var label_words = d.character === "Classmates" ? "Naoko, Chiharu, Rika and/or Yamazaki appear" : d.character === "Nakuru" ? "Ruby Moon (also known as Nakuru) appears" : d.character === "Spinel" ? "Spinel Sun appears" : d.character + " appears";
            line_label.text("chapters that " + label_words + " in");

            //Highlight the chapters this character appears in
            var char_chapters = character_data
                .filter(function(c) { return c.character === d.character; })
                .map(function(c) { return c.chapter; });
            chapter_slice.filter(function(c,j) { return _.indexOf(char_chapters,j+1) >= 0; })
                .style("fill", characterByName[d.character].color)
                .style("stroke", characterByName[d.character].color);
            chapter_number.filter(function(c,j) { return _.indexOf(char_chapters,j+1) >= 0; })
                .style("fill", "white");
            chapter_dot.filter(function(c,j) { return _.indexOf(char_chapters,j+1) >= 0; })
                .style("opacity", 0);

        }//function mouse_over_character

        function mouse_out_character() {
            ctx.clearRect(-width/2, -height/2, width, height);
            ctx.globalAlpha = 0.2;
            create_lines(cover_data);

            //Update the label text
            line_label.text(default_label_text)
            remove_text_timer = setTimeout(function() { line_label.text("")}, 4000);

            //Chapter donut back to normal
            chapter_slice.style("fill", "white").style("stroke", "#c4c4c4");
            chapter_number.style("fill", null);
            chapter_dot.style("opacity", 1)
        }//function mouse_out_character

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
            .style("stroke-width", function(d) {return stroke_relation(d.type) * size_factor; })
            .style("stroke-linecap", "round")
            .style("mix-blend-mode", "multiply")
            .style("opacity", 0.7)
            .attr("d", function(d) { 
                var source_a = characterByName[d.source].name_angle,
                    target_a = characterByName[d.target].name_angle;
                var x1 = rad_relation * Math.cos(source_a - pi1_2),
                    y1 = rad_relation * Math.sin(source_a - pi1_2),
                    x2 = rad_relation * Math.cos(target_a - pi1_2),
                    y2 = rad_relation * Math.sin(target_a - pi1_2);
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
        ///////////////////////// Create chapter donut chart //////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        //Create groups in right order
        var donut_chapter_group = chart.append("g").attr("class", "donut-chapter-group");
        var chapter_dot_group = chart.append("g").attr("class", "chapter-dot-group");
        var chapter_num_group = chart.append("g").attr("class", "chapter-number-group");

        //Arc command for the chapter number donut chart
        var arc_chapter = d3.arc()
            .outerRadius(rad_chapter_donut_outer)
            .innerRadius(rad_chapter_donut_inner)
            .padAngle(0.01)
            .cornerRadius((rad_chapter_donut_outer - rad_chapter_donut_inner) / 2)

        //Create the donut slices per character (and the number of chapters they appeared in)
        var chapter_slice = donut_chapter_group.selectAll(".arc")
            .data(chapter_location_data)
            .enter().append("path")
            .attr("class", "arc")
            .attr("d", arc_chapter)
            .style("fill", "none")
            .style("stroke", "#c4c4c4")
            .style("stroke-width", 1 * size_factor);

        //The text is placed in the center of each donut slice
        var rad_chapter_donut_half = ((rad_chapter_donut_outer - rad_chapter_donut_inner) / 2 + rad_chapter_donut_inner);
                
        //Add chapter number text
        var chapter_number = chapter_num_group.selectAll(".chapter-number")
            .data(chapter_location_data)
            .enter().append("text")
            .attr("class", "chapter-number")
            .style("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("transform", function (d, i) {
                var angle = d.centerAngle * 180 / Math.PI - 90;
                return "rotate(" + angle + ")translate(" + rad_chapter_donut_half + ")" +
                    // (d.centerAngle > 0 & d.centerAngle < Math.PI ? "" : "rotate(180)")
                    "rotate(" + -angle + ")";
            })
            .style("font-size", (9*size_factor) + "px")
            .text(function (d, i) { return i + 1; });

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////// Create volume donut chart //////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        //Create groups in right order
        var donut_volume_group = chart.append("g").attr("class", "donut-volume-group");

        //Arc command for the chapter number donut chart
        var arc_volume = d3.arc()
            .outerRadius(rad_volume_donut_outer)
            .innerRadius(rad_volume_donut_inner)
            .padAngle(0.01)
            .cornerRadius((rad_volume_donut_outer - rad_volume_donut_inner) / 2);

        //Create the arcs data
        var volume_data = [
            {volume: 1, num_chapters: 5, chapter_start: 1, chapter_end: 5},
            {volume: 2, num_chapters: 5, chapter_start: 6, chapter_end: 10},
            {volume: 4, num_chapters: 4, chapter_start: 11, chapter_end: 14},
            {volume: 3, num_chapters: 4, chapter_start: 15, chapter_end: 18},
            {volume: 5, num_chapters: 4, chapter_start: 19, chapter_end: 22},
            {volume: 6, num_chapters: 4, chapter_start: 23, chapter_end: 26},
            {volume: 7, num_chapters: 4, chapter_start: 27, chapter_end: 30},
            {volume: 8, num_chapters: 4, chapter_start: 31, chapter_end: 34},
            {volume: 9, num_chapters: 4, chapter_start: 35, chapter_end: 38},
            {volume: 10, num_chapters: 4, chapter_start: 39, chapter_end: 42},
            {volume: 11, num_chapters: 3, chapter_start: 43, chapter_end: 45},
            {volume: 12, num_chapters: 5, chapter_start: 46, chapter_end: 50}
        ];
        //Figure out the start and end angle
        volume_data.forEach(function (d, i) {
            d.startAngle = chapter_location_data[d.chapter_start-1].startAngle,
            d.endAngle = chapter_location_data[d.chapter_end-1].endAngle;
            d.centerAngle = (d.endAngle - d.startAngle) / 2 + d.startAngle;
        });

        //Create the donut slices per character (and the number of chapters they appeared in)
        var volume_slice = donut_volume_group.selectAll(".arc")
            .data(volume_data)
            .enter().append("path")
            .attr("class", "arc")
            .attr("d", arc_volume)
            .style("fill", function(d,i) { return d.volume <= 6 ? color_kero : color_sakura; })
            .style("opacity", 0.4);

        //The text is placed in the center of each donut slice
        var rad_volume_donut_half = ((rad_volume_donut_outer - rad_volume_donut_inner) / 2 + rad_volume_donut_inner);
                
        // // //Add chapter number text
        // // var chapter_number = chapter_num_group.selectAll(".chapter-number")
        // //     .data(chapter_arcs)
        // //     .enter().append("text")
        // //     .attr("class", "chapter-number")
        // //     .style("text-anchor", "middle")
        // //     .attr("dy", ".35em")
        // //     .attr("transform", function (d, i) {
        // //         var angle = d.centerAngle * 180 / Math.PI - 90;
        // //         return "rotate(" + angle + ")translate(" + rad_chapter_donut_half + ")" +
        // //             // (d.centerAngle > 0 & d.centerAngle < Math.PI ? "" : "rotate(180)")
        // //             "rotate(" + -angle + ")";
        // //     })
        // //     .style("font-size", (9*size_factor) + "px")
        // //     .text(function (d, i) { return i + 1; });

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////// Create dots for each chapter group //////////////////
        /////////////////////////////////////////////////////////////////////////// 

        //Add a circle at the inside of each chapter
        var chapter_dot = chapter_dot_group.selectAll(".chapter-dot")
            .data(chapter_location_data)
            .enter().append("circle")
            .attr("class", "chapter-dot")
            .attr("cx", function (d) { return rad_dot_color * Math.cos(d.centerAngle - pi1_2); })
            .attr("cy", function (d) { return rad_dot_color * Math.sin(d.centerAngle - pi1_2); })
            .attr("r", 3 * size_factor)
            .style("fill", "#c4c4c4")
            .style("stroke", "white")
            .style("stroke-width", 1.5 * size_factor);

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////// Create hidden chapter hover areas ///////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var arc_chapter_hover = d3.arc()
            .outerRadius(rad_color_outer)
            .innerRadius(rad_dot_color);

        //Create the donut slices per chapter
        var chapter_hover_group = chart.append("g").attr("class", "chapter-hover-group");
        var chapter_hover = chapter_hover_group.selectAll(".chapter-hover-arc")
            .data(chapter_location_data)
            .enter().append("path")
            .attr("class", "chapter-hover-arc")
            .attr("d", arc_chapter_hover)
            .style("fill", "none")
            .style("pointer-events", "all");

        //When you mouse over a chapter arc
        function mouse_over_chapter(d,i) {
            ctx.clearRect(-width / 2, -height / 2, width, height);
            ctx.globalAlpha = 0.8;
            create_lines(character_data.filter(function (c) { return c.chapter === i+1; }));
            //Update label path
            line_label_path.attr("d", label_arc(d.centerAngle));

            //Update the label text
            clearTimeout(remove_text_timer);
            line_label.text("characters that appear in chapter " + (i+1) );

            //Highlight the characters that appear in this chapter
            var char_chapters = character_data
                .filter(function(c) { return c.chapter === i+1; })
                .map(function(c) { return c.character; });
            names.filter(function(c) { return _.indexOf(char_chapters, c.character) < 0; })
                .style("opacity", 0.2);
            name_dot.filter(function(c) { return _.indexOf(char_chapters, c.character) < 0; })
                .style("opacity", 0.2);

            //Highlight the chapter donut slice
            chapter_slice.filter(function (c, j) { return i === j; })
                .style("fill", color_sakura)
                .style("stroke", color_sakura);
            chapter_number.filter(function (c, j) { return i === j; })
                .style("fill", "white");
        }//function mouse_over_chapter

        //When you mouse out a chapter arcs
        function mouse_out_chapter() {
            ctx.clearRect(-width / 2, -height / 2, width, height);
            ctx.globalAlpha = 0.2;
            create_lines(cover_data);

            //Update the label text
            line_label.text(default_label_text)
            remove_text_timer = setTimeout(function() { line_label.text("")}, 4000);

            //Character names back to normal
            names.style("opacity", null);
            name_dot.style("opacity", null);

            //Chapter donut back to normal
            chapter_slice.style("fill", "white").style("stroke", "#c4c4c4");
            chapter_number.style("fill", null);
        }//function mouse_out_chapter

        ///////////////////////////////////////////////////////////////////////////
        ///////////////////////// Create line title label /////////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var line_label_group = chart.append("g").attr("class", "line-label-group");

        //Define the arc on which to draw the label text
        function label_arc(angle) {
            var x1 = rad_line_label * Math.cos(angle + 0.01 - pi1_2),
                y1 = rad_line_label * Math.sin(angle + 0.01 - pi1_2);
            var x2 = rad_line_label * Math.cos(angle - 0.01 - pi1_2),
                y2 = rad_line_label * Math.sin(angle - 0.01 - pi1_2);
            if(angle/Math.PI > 0.5 && angle/Math.PI < 1.5) {
                return "M" + x1 + "," + y1 + " A" + rad_line_label + "," + rad_line_label + " 0 1 1 " + x2 + "," + y2;
            } else {
                return "M" + x2 + "," + y2 + " A" + rad_line_label + "," + rad_line_label + " 0 1 0 " + x1 + "," + y1;
            }//else
        }//function label_arc

        //Create the paths along which the pillar labels will run
        var line_label_path = line_label_group.append("path")
            .attr("class", "line-label-path")
            .attr("id", "line-label-path")
            .attr("d", label_arc(characterByName["Sakura"].name_angle))
            .style("fill", "none")
            .style("display", "none");

        //Create the label text
        var default_label_text = "these lines show which characters appear on the chapter's cover art";
        var line_label = line_label_group.append("text")
            .attr("class", "line-label")
            .attr("dy", "0.35em")
            .style("text-anchor", "middle")
            .style("font-size", (14 * size_factor) + "px")
            .append("textPath")
            .attr("xlink:href", "#line-label-path")
            .attr("startOffset", "50%")
            .text(default_label_text);

        ///////////////////////////////////////////////////////////////////////////
        //////////////////////// Create captured card labels //////////////////////
        /////////////////////////////////////////////////////////////////////////// 

        var card_group = chart.append("g").attr("class", "card-group");

        //Create a group per character
        var card_label = card_group.selectAll(".card-label")
            .data(chapter_total_data)
            .enter().append("text")
            .attr("class", "card-label")
            .attr("dy", ".35em")
            .each(function(d,i) {
                d.centerAngle = chapter_location_data[d.chapter-1].centerAngle;
            })
            .attr("transform", function (d, i) {
                return "rotate(" + (d.centerAngle * 180 / Math.PI - 90) + ")"
                    + "translate(" + rad_card_label + ")"
                    + (d.centerAngle > 0 & d.centerAngle < Math.PI ? "" : "rotate(180)");
            })
            .style("text-anchor", function (d) { return d.centerAngle > 0 & d.centerAngle < Math.PI ? "start" : "end"; })
            .style("font-size", (9 * size_factor) + "px")
            .text(function (d, i) { return d.card_captured; });

        ///////////////////////////////////////////////////////////////////////////
        ////////////// Function to create character - chapter lines ///////////////
        /////////////////////////////////////////////////////////////////////////// 

        ctx.globalAlpha = 0.3;
        ctx.globalCompositeOperation = "multiply";
        ctx.lineCap = "round";
        create_lines(cover_data);

        function create_lines(data) {

            // data.forEach(function(d,i) {
            for(var i = 0; i < data.length; i++) {
                d = data[i];

                // console.log(d)
                var source_a = characterByName[d.character].name_angle,
                    source_r = characterByName[d.character].dot_name_rad
                    target_a = chapter_location_data[d.chapter-1].centerAngle;
                var xs = source_r * Math.cos(source_a - pi1_2),
                    ys = source_r * Math.sin(source_a - pi1_2),
                    xt = rad_dot_color * Math.cos(target_a - pi1_2),
                    yt = rad_dot_color * Math.sin(target_a - pi1_2);
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
                    .range([0.001,0.01]);
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
                var start_rad_offset = scale_start_rad_offset(da) * size_factor;
                var cx1 = (source_r + start_rad_offset) * Math.cos(source_a + angle_sign * start_angle_offset * Math.PI - pi1_2),
                    cy1 = (source_r + start_rad_offset) * Math.sin(source_a + angle_sign * start_angle_offset * Math.PI - pi1_2);


                //Calculate the radius of the middle point of the line
                var scale_rad_middle = d3.scaleLinear()
                    .domain([0, 1])
                    .range([0.26, 0.3]);
                var rad_middle_line = scale_rad_middle(da) * width;
                var scale_rad_width = d3.scaleLinear()
                    .domain([0, 1])
                    .range([4, 4]);
                var rad_width = scale_rad_width(da);
                rad_middle_line += rad_width * size_factor;
                //Location of the "middle" point
                var xm = rad_middle_line * Math.cos(middle_a - pi1_2),
                    ym = rad_middle_line * Math.sin(middle_a - pi1_2);
                    

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
                var first_anchor_offset = scale_first_anchor(da) * size_factor;
                var cx2 = xm + sign_x * first_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy2 = ym + sign_y * first_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);
                //Second anchor to middle
                var scale_second_anchor = d3.scaleLinear()
                    .domain([0,1])
                    .range([20,120]);
                var second_anchor_offset = scale_second_anchor(da) * size_factor;
                var cx3 = xm - sign_x * second_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy3 = ym - sign_y * second_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);


                //Anchor point connected to target location
                var scale_end_offset = d3.scaleLinear()
                    .domain([0,1])
                    .range([0,0.03]);
                var scale_end_rad_offset = d3.scaleLinear()
                    .domain([0,1])
                    .range([50,30]);
                var end_rad_offset = scale_end_rad_offset(da) * size_factor;
                var end_angle_offset = scale_end_offset(da);
                end_angle_offset += 0.002;
                var cx4 = (rad_dot_color - end_rad_offset) * Math.cos(target_a - angle_sign * end_angle_offset * Math.PI - pi1_2),
                    cy4 = (rad_dot_color - end_rad_offset) * Math.sin(target_a - angle_sign * end_angle_offset * Math.PI - pi1_2);


                //Start drawing the path from source to target
                ctx.beginPath();
                ctx.moveTo(xs, ys);

                if(da/Math.PI > 0.02) {
                    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, xm, ym);
                    ctx.bezierCurveTo(cx3, cy3, cx4, cy4, xt, yt);
                } else {
                    ctx.bezierCurveTo(cx1, cy1, cx4, cy4, xt, yt);
                }//else

                // ctx.globalAlpha = 0.4;
                // ctx.strokeStyle = characterByName[d.character].color;
                // ctx.lineWidth = 5 * size_factor;
                // ctx.stroke(); 
                // continue;

                //Create the portion back to create the tapered stroke
                start_angle_offset += 2*source_width;
                var cx1b = (source_r + start_rad_offset) * Math.cos(source_a + angle_sign * start_angle_offset * Math.PI - pi1_2),
                    cy1b = (source_r + start_rad_offset) * Math.sin(source_a + angle_sign * start_angle_offset * Math.PI - pi1_2);

                rad_middle_line -= 2*rad_width;
                //Location of the "middle" point
                var xmb = rad_middle_line * Math.cos(middle_a - pi1_2),
                    ymb = rad_middle_line * Math.sin(middle_a - pi1_2);
                middle_angle_offset += 0.01;
                //First anchor to middle
                var cx2b = xmb + sign_x * first_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy2b = ymb + sign_y * first_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);
                //Second anchor to middle
                var cx3b = xmb - sign_x * second_anchor_offset * Math.cos(tangent_a + middle_angle_offset*Math.PI),
                    cy3b = ymb - sign_y * second_anchor_offset * Math.sin(tangent_a + middle_angle_offset*Math.PI);

                end_angle_offset -= 0.004;
                var cx4b = (rad_dot_color - end_rad_offset) * Math.cos(target_a - angle_sign * end_angle_offset * Math.PI - pi1_2),
                    cy4b = (rad_dot_color - end_rad_offset) * Math.sin(target_a - angle_sign * end_angle_offset * Math.PI - pi1_2);

                if(da/Math.PI > 0.02) {
                    ctx.bezierCurveTo(cx4b, cy4b, cx3b, cy3b, xmb, ymb);
                    ctx.bezierCurveTo(cx2b, cy2b, cx1b, cy1b, xs, ys);
                } else {
                    ctx.bezierCurveTo(cx4b, cy4b, cx1b, cy1b, xs, ys);
                }//else
                
                //Draw and fill the path
                ctx.fillStyle = characterByName[d.character].color;
                ctx.fill();             

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
            }//for

        }//function create_lines  

    }//function draw

    // Retina non-blurry canvas
    function crispyCanvas(canvas, ctx, sf) {
        canvas
            .attr('width', sf * width)
            .attr('height', sf * height)
            .style('width', width + "px")
            .style('height', height + "px");
        ctx.scale(sf, sf);
    }//function crispyCanvas


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

