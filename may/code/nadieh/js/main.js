///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Constants ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const pi = Math.PI
const pi1_2 = Math.PI / 2
const pi2 = Math.PI * 2
const ecliptic_angle = 23.44 //The angle the tilted Earth makes with the plane or rotation around the Sun, in degrees

const basemap_margin = {
    left: 50,
    top: 50,
    right: 50,
    bottom: 50
}
const basemap_size = 800
const basemap_total_size = basemap_size + basemap_margin.left + basemap_margin.right
const size_factor = basemap_size / basemap_total_size

const font_family = "Glass Antiqua"
// const font_family = "Cormorant"

const cultures = []
cultures["arabic"] = {color: "#EFB605"}
cultures["arabic_moon_stations"] = {color: "#EBAF02"}
cultures["aztec"] = {color: "#E8A400"}
cultures["belarusian"] = {color: "#E69201"}
cultures["boorong"] = {color: "#E47607"}
cultures["chinese"] = {color: "#E45311"}
cultures["dakota"] = {color: "#E3301C"}
cultures["egyptian"] = {color: "#DF1428"}
cultures["hawaiian_starlines"] = {color: "#D80533"}
cultures["indian"] = {color: "#CE003D"}
cultures["inuit"] = {color: "#C30048"}
cultures["japanese_moon_stations"] = {color: "#B80452"}
cultures["kamilaroi"] = {color: "#AC0C5E"}
cultures["korean"] = {color: "#9F166A"}
cultures["macedonian"] = {color: "#932278"}
cultures["maori"] = {color: "#852F87"}
cultures["mongolian"] = {color: "#763C95"}
cultures["navajo"] = {color: "#644AA0"}
cultures["norse"] = {color: "#4F56A6"}
cultures["ojibwe"] = {color: "#3963A7"}
cultures["romanian"] = {color: "#2570A2"}
cultures["sami"] = {color: "#148097"}
cultures["sardinian"] = {color: "#0A9087"}
cultures["siberian"] = {color: "#099E77"}
cultures["tongan"] = {color: "#17AA69"}
cultures["tukano"] = {color: "#31B15F"}
cultures["tupi"] = {color: "#55B558"}
cultures["western"] = {color: "#7EB852"}


//TODO: Star names
//TODO: Color legend around small multiple
//TODO: Constellation names with color legend
//TODO: Drawn images on top for the main one?

function setupStarMaps(stars, star_by_id, const_links, const_names, const_per_star, zodiac) {

    let focus
    let margin, width, height, total_width, total_height
    let constellations, chosen_const
    let location
    let currentOrion = "all"

    //Create one variable that has all the (unchangeable data)
    let opts_data = {
        stars: stars,
        star_by_id: star_by_id,
        const_links: const_links,
        const_names: const_names,
        const_per_star: const_per_star,
        zodiac: zodiac
    }

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////// Create Orion ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    setSizes(20, 900, 900)

    //Orion's Betelgeuse
    focus = {
        hip: 27989,
        proper: "Betelgeuse",
        center: [5.603559, 3.20192], //ra in hours dec in degrees
        scale: 1950,
    }  //4: egyptian-005 & 11: navajo-008 & 15: tupi-002 & 16: western-Ori

    ////////////////////////////// Create Canvases ///////////////////////////////

    //Create the canvas
    const canvas_orion = d3.select("#chart-orion").append("canvas")
        .attr("id", "canvas-orion")
        .style("z-index", -1)
    const ctx_orion = canvas_orion.node().getContext("2d")
    crispyCanvas(canvas_orion, ctx_orion, total_width, total_height, 0)

    const canvas_orion_mini = d3.select("#chart-orion").append("canvas")
        .attr("id", "canvas-orion-mini")
    const ctx_orion_mini = canvas_orion_mini.node().getContext("2d")
    crispyCanvas(canvas_orion_mini, ctx_orion_mini, total_width, total_height, 0)

    ////////////////////////////// Create SVG ///////////////////////////////

    //Create the SVG on top
    const svg_orion = d3.select("#chart-orion").append("svg")
        .attr("id", "svg-orion")
        .attr("width", total_width)
        .attr("height", total_height)
        // .append("g")
        //.attr("transform", "translate(" + [margin.left, margin.top] + ")")
    
    //A group for the fade-out / fade-in group when an outside mini map is clicked
    const svg_hide_group = svg_orion.append("g")
        .attr("class", "chart-orion-hide-group")
        .style("opacity", 0)
    //Append a rectangle that is as big as the SVG
    svg_hide_group.append("rect")
        .attr("width", total_width)
        .attr("height", total_height)
        .style("fill", "white")
        .on("click", () => { switchOrionCenter("body") })
    //Append text in the middle
    svg_hide_group.append("text")
        .attr("class", "chart-orion-text")
        .attr("x", width/2 + margin.left)
        .attr("y", height/2 + margin.top - 55)
        .attr("dy", "0.35em")
        .text("Creating the Sky Map of")
    const svg_orion_text_const_name = svg_hide_group.append("text")
        .attr("class", "chart-orion-text-name")
        .attr("x", width/2 + margin.left)
        .attr("y", height/2 + margin.top + 0)
        .attr("dy", "0.35em")
        .text("")
    const svg_orion_text_culture = svg_hide_group.append("text")
        .attr("class", "chart-orion-text-culture")
        .attr("x", width/2 + margin.left)
        .attr("y", height/2 + margin.top + 40)
        .attr("dy", "0.35em")
        .text("")

    //Create the title in the top left corner
    const title_group = svg_orion.append("g")
        .attr("class", "chart-orion-title-group")
    let offsets = [10, 28, 78]
    title_group.selectAll(".chart-orion-title")
        .data(["The cultures & constellations","that use the star","Betelgeuse"])
        .enter().append("text")
        .attr("class", "chart-orion-title")
        .classed("chart-orion-star-title", (d,i) => i === 2 ? true : false)
        .attr("x", 25)
        .attr("y", (d,i) => offsets[i])
        .text(d => d)

    ////////////////////////////// Create center ///////////////////////////////

    //Get all of the constellations that include the chosen star
    constellations = const_per_star
        .filter(d => d.star_id === focus.hip)
        .map(d => d.const_id)
        .sort()
    // console.log(chosen_const)
    
    //Create the central image of all constellations that use Orion
    let center_size = 650
    chosen_const = constellations
    location = {
        x: (total_width - center_size)/2, 
        y: (total_height - center_size)/2, 
        width: center_size, 
        height: center_size
    }
    drawMap(canvas_orion, ctx_orion, focus, constellations, chosen_const, location)

    ////////////////////////////// Create mini-maps ///////////////////////////////

    //Figure out the sizes of the mini constellations-only circles around the central big one
    let n_const = constellations.length
    let angle = pi / n_const
    let padding = 40
    let padding_center = 30
    let r = Math.min(100, ((center_size/2 - padding) * Math.sin(angle))/(1 - Math.sin(angle)))
    let rR = center_size/2 - padding + r + padding_center

    let stroke_w = 1.5
    constellations.forEach((d,i) => {
        //Find the central location
        let chosen_const = constellations[i]
        let x = rR * Math.cos((i) * 2*angle - pi1_2)
        let y = rR * Math.sin((i) * 2*angle - pi1_2)
        let location = {x: x + width/2 + margin.left - r, y: y + height/2 + margin.top - r, width: 2*r, height: 2*r}

        //Create and draw the map on the canvas
        miniMapsCircle(ctx_orion_mini, focus, constellations, chosen_const, location)

        //Create the circle and text on the svg
        let const_color = cultures[constellationCulture(chosen_const)].color
        svg_orion.append("path")
            .datum(chosen_const)
            .attr("class", "chart-orion-mini-map-circle")
            .attr("id", "chart-orion-mini-map-path-" + i)
            .attr("d", () => {
                let rad = r * size_factor// + stroke_w/2
                let cx = x + width/2 + margin.left
                let cy = y + height/2 + margin.top
                return "M " + [cx, cy + rad] + " A " + [rad, rad] + " 0 1 1 " + [cx + 0.01, cy + rad] 
            })
            .style("fill", "none")
            // .style("fill-opacity", 0.5)
            .style("stroke", const_color)
            .style("stroke-width", stroke_w)
            .style("cursor", "pointer")
            .style("pointer-events", "all")
            // .style("opacity",0)
            .on("click", switchOrionCenter)

        //Draw the text on top
        svg_orion.append("text")
            .attr("class", "chart-orion-mini-map-culture")
            .attr("dy", -6)
            .append("textPath")
            .attr("xlink:href", "#chart-orion-mini-map-path-" + i)
            .attr("startOffset", "50%")
            .style("text-anchor", "middle")
            .style("fill", const_color)
            .text(constellationCultureCap(chosen_const))
    })

    //Function to create, downscale and draw the mini constellation charts
    function miniMapsCircle(ctx, focus, constellations, chosen_const, loc) {
        let new_size, new_canvas
        
        //Get the original constellation line canvas
        const basemap = createBaseMap(opts_data, focus, constellations, chosen_const, "small")

        //Down-scaling in steps to reduce anti-aliasing
        //Based on https://stackoverflow.com/a/17862644/2586314
        function drawToTemp(ctx_to_draw, size) {
            let canvas_temp = document.createElement('canvas')
            let ctx_temp = canvas_temp.getContext('2d')
            canvas_temp.width = size
            canvas_temp.height = size
            ctx_temp.fillStyle = "white"
            ctx_temp.drawImage(ctx_to_draw, 0, 0, canvas_temp.width, canvas_temp.height)

            return canvas_temp
        }//function drawToTemp
        
        //Downscale in steps
        new_size = basemap_total_size / 2
        new_canvas = drawToTemp(basemap.canvas_lines, new_size)
        new_size = new_size / 2
        new_canvas = drawToTemp(new_canvas, new_size)
        ctx.drawImage(new_canvas, 0, 0, new_size, new_size, 
                      loc.x, loc.y, loc.width, loc.height)

    }//function miniMapsCircle

    ////////////////////////////// Click interaction ///////////////////////////////

    //Switch the star map in the middle to the clicked on constellation
    function switchOrionCenter(d) {
        d3.event.stopPropagation()
        let chosen

        //Don't do anything if the click comes not from a mini-map and the central map is already all
        if(d === "body" && currentOrion === "all") return
        
        if (d !== "body" && d !== currentOrion) {
            //If the same circle isn't clicked twice in a row, change to the new mini map
            chosen = d
            currentOrion = d
            //Update central text
            svg_orion_text_culture
                .style("fill", cultures[constellationCulture(d)].color)
                .text(constellationCultureCap(d))
            let const_name = const_names[const_names.map(c => c.const_id).indexOf(d)].const_name
            svg_orion_text_const_name.text(const_name)
            //Change the thick stroke of the chosen constellation
            d3.selectAll(".chart-orion-mini-map-circle")
                .transition("stroke").duration(600)
                .style("stroke-width", c => (c === d ? 3 : 1) * stroke_w)
        } else {
            //If the same one is clicked again, go back to "all"
            chosen = chosen_const
            currentOrion = "all"
            //Update central text
            svg_orion_text_culture.text("")
            svg_orion_text_const_name.text("all cultures")
            //Remove the thicker stroke
            d3.selectAll(".chart-orion-mini-map-circle")
                .transition("stroke").duration(600)
                .style("stroke-width", stroke_w)
        }//else

        //Fade the center in and out 
        svg_hide_group.transition("fade").duration(600)
            .style("opacity", 1)
            .on("end", function() {
                //Draw the new map
                drawMap(canvas_orion, ctx_orion, focus, constellations, chosen, location)
                //Fade back in
                d3.select(this)
                    .transition("fade").duration(600).delay(1000)
                    .style("opacity", 0)
            })
    }//function switchOrionCenter

    ///////////////////////////////////////////////////////////////////////////
    //////////////////////////// Helper functions /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //Set the sizes of the canvas
    function setSizes(m, w, h) {
        margin = { left: m, top: m, right: m, bottom: m }
        width = w
        height = h
        total_width = margin.left + width + margin.right
        total_height = margin.top + height + margin.bottom
    }//function setSizes

    //Create the standard sky map with background, stars and lines
    function drawMap(canvas, ctx, focus, constellations, chosen_const, loc) {
        const basemap = createBaseMap(opts_data, focus, constellations, chosen_const, "big")
        ctx.clearRect(0, 0, canvas.width || canvas.node().width, canvas.height ||canvas.node().height)
        ctx.drawImage(basemap.canvas_space, loc.x, loc.y, loc.width, loc.height)
        ctx.drawImage(basemap.canvas_stars, loc.x, loc.y, loc.width, loc.height)
        ctx.drawImage(basemap.canvas_lines, loc.x, loc.y, loc.width, loc.height)
    }//function drawMap

}//function setupStarMaps


///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create a star map ////////////////////////////
///////////////////////////////////////////////////////////////////////////

function createBaseMap(opts_data, focus_star, constellations, chosen_const, type) {

    const stars = opts_data.stars
    const star_by_id = opts_data.star_by_id
    const const_links = opts_data.const_links
    const const_names = opts_data.const_names
    const const_per_star = opts_data.const_per_star
    const zodiac = opts_data.zodiac

    let focus = JSON.parse(JSON.stringify(focus_star)) //Create deep clone

    let margin = basemap_margin
    let width = basemap_size
    let height = basemap_size

    let total_width = margin.left + width + margin.right
    let total_height = margin.top + height + margin.bottom

    ///////////////////////////////////////////////////////////////////////////
    /////////////////////////// Set-up projections ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // //Get all of the constellations that include this star
    // let constellations = const_per_star.filter(d => d.star_id === focus.hip).map(d => d.const_id).sort()
    // let chosen_const = constellations[16] //focus.culture === "all" ? constellations : constellations[focus.culture]
    // // console.log(chosen_const)

    // //Create a color scale for these constellations
    // const color_scale_const = d3.scaleOrdinal()
    //     .domain(constellations)
    //     .range(d3.range(constellations.length).map(d => d / (constellations.length - 1)))

    //Get the projection variables
    const [projection, clip_radius, clip_angle] = createProjection(width, height, margin, focus, chosen_const, const_per_star)
   
    //Radius of the stars
    const radius_scale = d3.scalePow()
        .exponent(0.7)
        .domain([-2, 6, 11])
        .range([9, 0.5, 0.1].map(d => {
            const focus_scale = d3.scaleLinear()
                .domain([300, 2600])
                .range([0.6, 1.5])
            return d * focus_scale(focus.scale)
        }))

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Draw star maps //////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    let opts_general = {
        margin: margin,
        width: width,
        height: height,
        projection: projection,
        focus: focus,
        type: type,
        clip_radius: clip_radius
    }

    let canvas_space, canvas_stars, canvas_lines
    /////////////////////// Draw deep space base map ////////////////////////
    if(type === "big") {
        let opts_space = {
            clip_angle: clip_angle
        }
        canvas_space = drawDeepSpace(opts_general, opts_space)
        // ctx.drawImage(canvas_space, 0, 0, total_width, total_height)
    }//if

    /////////////////////// Draw stars ////////////////////////
    if(type === "big") {
        let opts_stars = {
            stars: stars,
            radius_scale: radius_scale
        }
        canvas_stars = drawStars(opts_general, opts_stars) 
        // ctx.drawImage(canvas_stars, 0, 0, total_width, total_height)
    }//if

    /////////////////////// Draw constellations ////////////////////////
    let opts_lines = {
        radius_scale: radius_scale,
        constellations: chosen_const,
        star_by_id: star_by_id,
        const_links: const_links,
    }
    canvas_lines = drawConstellations(opts_general, opts_lines)
    // ctx.drawImage(canvas_lines, 0, 0, total_width, total_height)

    return {canvas_space: canvas_space, canvas_stars: canvas_stars, canvas_lines: canvas_lines}

}//function createBaseMap

///////////////////////////////////////////////////////////////////////////
//////////////////////// General helper functions /////////////////////////
///////////////////////////////////////////////////////////////////////////

////////////////// Retina non-blurry canvas //////////////////
function crispyCanvas(canvas, ctx, total_width, total_height, offscreen) {
    let sf = getPixelRatio(ctx)
    // console.log(sf)
    if(!offscreen) {
        canvas
            .attr("width", sf * total_width)
            .attr("height", sf * total_height)
            .style("width", total_width + "px")
            .style("height", total_height + "px")
    } else {
        canvas.width = sf * total_width
        canvas.height = sf * total_height
    }//else
    ctx.scale(sf, sf)
    //ctx.translate(margin.left + width/2, margin.top + height/2)
}//function crispyCanvas

////////////////// Find the device pixel ratio //////////////////
function getPixelRatio(ctx) {
    //From https://www.html5rocks.com/en/tutorials/canvas/hidpi/
    let devicePixelRatio = window.devicePixelRatio || 1
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1
    let ratio = devicePixelRatio / backingStoreRatio
    return ratio
}//function getPixelRatio

////////////////// Clip the canvas image to the circle //////////////////
function clipToCircle(ctx, width, height, margin, clip_radius) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(width/2 + margin.left, height/2 + margin.top, clip_radius, 0, pi2)
    ctx.closePath()
    ctx.clip()
}//function clipToCircle

////////////////// Return projected coordinates //////////////////
function pixelPos(ra, dec, projection) { return projection([-ra * (360/24), dec]) }

//Get the base constellation name with all lower and _ instead of spaces
function constellationCulture(s) {
    let n = s.indexOf("-")
    s = s.substring(0, n != -1 ? n : s.length)
    return s
}//function constellationCulture

//Returns the Capitalized culture of the constellation
function constellationCultureCap(s) {
    let n = constellationCulture(s)
    //Replace _ by space
    n = n.replace(/_/g, ' ')
    //Capitalize first letter
    n = n.charAt(0).toUpperCase() + n.slice(1)
    return n
}//function constellationCultureCap

///////////////////////////////////////////////////////////////////////////
////////////////////////// Star focus settings ////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Maybe Altair: 97649 - [19.846388, 8.868322]
// Acrux: 60718 - [12.443311, -63.099092]
// Spica: 65474 - [13.419883, -11.161322]
//Maybe Antares: 80763 - [16.490128, -26.432002]
// Pollux: 37826 - [7.755277, 28.026199]

// //Southern cross
// let focus = {
//     hip: 62434, //Becrux
//     culture: "all",
//     center: [12.55, -60], //ra in hours dec in degrees
//     scale: 4500
// }
// //8: tupi-004 & 1: booring-Bun & 4: korean-022

// //Sirius
// let focus = {
//     hip: 32349,
//     culture: "all",
//     center: [6.752481, -19.71612], //ra in hours dec in degrees
//     scale: 2200, //1250
//     // clip_angle: 90,
//     // radius_scaling: 1 //scaling of the star's pixel sizes
// }
// //7: hawaiian_starlines-KOM & 11: western-CMa

// //Pleiades
// let focus = {
//     hip: 17702, //Alycone
//     center: [3.791419, 24.10514],
//     scale: 30050,
//     // clip_angle: 60,
//     // radius_scaling: 1
// }

// //Swan -> Cygnus: Central star Sadr
// let focus = {
//     // hip: 91262, //Vega
//     hip: 102098, //Deneb
//     // hip: 97649, //Altair
//     center: [20.37047, 40.25668],
//     scale: 1700, //1300,
//     // clip_angle: 90,
//     radius_scaling: 1
// }

// //Big dipper
// let focus = {
//     hip: 54061,
//     center: [11.5, 54],
//     scale: 1500,
//     // clip_angle: 100,
//     // radius_scaling: 0.6
// }
// //11: navajo-001 is a good one & 19: wester-UMa

// //The North, slightly offset
// let focus = {
//     hip: 11767, //Polaris
//     // hip: 67301,
//     center: [270, 70],
//     scale: 900,
//     // clip_angle: 100,
//     // radius_scaling: 1.2
// }