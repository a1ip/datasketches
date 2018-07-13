//TODO: Don't use basemap size, but actual final size (use type to figure it out)
//TODO: set up header stuff

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Constants ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Scale factor of canvas
let sf

const font_family = "Glass Antiqua"
// const font_family = "Cormorant"

const pi1_2 = Math.PI / 2
const pi = Math.PI
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

const orion_m = 20
const orion_size = 920

///////////// Culture data /////////////

//All cultures and their colors
const cultures = []
cultures["arabic"] = {culture: "arabic", color: "#EFB605", count: 49, mean_stars: 10.96}
cultures["arabic_moon_stations"] = {culture: "arabic_moon_stations", color: "#EBAF02", count: 28, mean_stars: 3.43}
cultures["aztec"] = {culture: "aztec", color: "#E8A400", count: 5, mean_stars: 8.4}
cultures["belarusian"] = {culture: "belarusian", color: "#E69201", count: 20, mean_stars: 5.95}
cultures["boorong"] = {culture: "boorong", color: "#E47607", count: 28, mean_stars: 7.93}
cultures["chinese"] = {culture: "chinese", color: "#E45311", count: 318, mean_stars: 4.46}
cultures["dakota"] = {culture: "dakota", color: "#E3301C", count: 13, mean_stars: 8.39}
cultures["egyptian"] = {culture: "egyptian", color: "#DF1428", count: 28, mean_stars: 9}
cultures["hawaiian_starlines"] = {culture: "hawaiian_starlines", color: "#D80533", count: 13, mean_stars: 6.85}
cultures["indian"] = {culture: "indian", color: "#CE003D", count: 28, mean_stars: 2.68}
cultures["inuit"] = {culture: "inuit", color: "#C30048", count: 11, mean_stars: 3.73}
cultures["japanese_moon_stations"] = {culture: "japanese_moon_stations", color: "#B80452", count: 28, mean_stars: 4.79}
cultures["kamilaroi"] = {culture: "kamilaroi", color: "#AC0C5E", count: 13, mean_stars: 1}
cultures["korean"] = {culture: "korean", color: "#9F166A", count: 272, mean_stars: 4.46}
cultures["macedonian"] = {culture: "macedonian", color: "#932278", count: 19, mean_stars: 3.95}
cultures["maori"] = {culture: "maori", color: "#852F87", count: 6, mean_stars: 5.33}
cultures["mongolian"] = {culture: "mongolian", color: "#763C95", count: 4, mean_stars: 6.25}
cultures["navajo"] = {culture: "navajo", color: "#644AA0", count: 8, mean_stars: 15.75}
cultures["norse"] = {culture: "norse", color: "#4F56A6", count: 6, mean_stars: 5.83}
cultures["ojibwe"] = {culture: "ojibwe", color: "#3963A7", count: 10, mean_stars: 9.6}
cultures["romanian"] = {culture: "romanian", color: "#2570A2", count: 39, mean_stars: 9.41}
cultures["sami"] = {culture: "sami", color: "#148097", count: 10, mean_stars: 3.3}
cultures["sardinian"] = {culture: "sardinian", color: "#0A9087", count: 11, mean_stars: 6.45}
cultures["siberian"] = {culture: "siberian", color: "#099E77", count: 3, mean_stars: 6.67}
cultures["tongan"] = {culture: "tongan", color: "#17AA69", count: 11, mean_stars: 4.27}
cultures["tukano"] = {culture: "tukano", color: "#31B15F", count: 11, mean_stars: 16.91}
cultures["tupi"] = {culture: "tupi", color: "#55B558", count: 7, mean_stars: 21.57}
cultures["western"] = {culture: "western", color: "#7EB852", count: 88, mean_stars: 7.90}

//Create array with all culture names
let culture_names = d3.keys(cultures)
// for(culture in cultures) culture_names.push(culture)

function setupStarMaps(stars, star_by_id, const_links, const_names, const_per_star, zodiac) {

    let chosen_culture

    //Create one variable that has all the (unchangeable data)
    let opts_data = {
        stars: stars,
        star_by_id: star_by_id,
        const_links: const_links,
        const_names: const_names,
        const_per_star: const_per_star,
        zodiac: zodiac
    }

    ////////////////////////// Header sky map //////////////////////////
    let focus_header = {
        culture: "western",
        center: [0, 0], //ra in hours dec in degrees
        scale: 250,
    }
    //Add the mouseover move effect
    rectangularMoveEffect("header","image") 

    ////////////////////////// Orion mini circles //////////////////////////
    let focus_betelgeuse = {
        hip: 27989,
        proper: "Betelgeuse",
        title_position: "bottom-left",
        center: [5.603559, 3.20192], //ra in hours dec in degrees
        scale: 1950,
    } //Interesting shapes | 4: egyptian-005 & 11: navajo-008 & 15: tupi-002 & 16: western-Ori

    ////////////////////////// Sirius medium map //////////////////////////
    let focus_sirius = {
        hip: 32349,
        proper: "Sirius",
        title_position: "top-right",
        center: [6.752481, -21], //ra in hours dec in degrees
        scale: 2600,
    } //Interesting shapes | 7: hawaiian_starlines-KOM & 11: western-CMa

    //Attach click event to the correct div
    d3.select("#chart-sirius")
        .on("click", () => { smallMapClick(focus_sirius, opts_data) })

    ////////////////////////// Big Dipper medium map //////////////////////////
    let focus_big_dipper = {
        hip: 54061,
        proper: "Dubhe",
        title_position: "top-left",
        center: [12.3, 56],
        scale: 2200,
    } //11: navajo-001 is a good one & 19: wester-UMa

    //Attach click event to the correct div
    d3.select("#chart-big-dipper")
        .on("click", () => { smallMapClick(focus_big_dipper, opts_data) })

    ////////////////////////// Small multiple charts //////////////////////////
    createSmallMultipleLayout(opts_data, "image")

    ////////////////////////// Statistical charts //////////////////////////

    createStatChartStars("stats-stars", stars)

    //createStatChartCultures("stats-cultures", 30, 330, 450, cultures)

    ////////////////////////// Culture rectangular sky map //////////////////////////
    chosen_culture = "hawaiian_starlines"
    let focus_culture = {
        culture: chosen_culture,
        center: [0, 0], //ra in hours dec in degrees
        scale: 250,
    }

    //Set the colors on the culture divs
    setCultureDivColors(chosen_culture)

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Run all the functions //////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    function breathableConcat() {
        return breathe.chain()   // creates a breathable chain
            // .then(() => {
            //     //Create the Sky Map behind the header - no longer needed, image is loaded
            //     //The full canvas version - no longer needed, image is loaded
            //     createStraightSkyMapLayoutFullCanvas(opts_data, focus_header, window.innerWidth, 1.5, 500, "header")
            // })
            .then(() => {
                //Create Orion's big circular layout
                createCentralCircleLayout(opts_data, focus_betelgeuse, orion_m, orion_size, orion_size, "orion")
            })
            // .then(() => {
            //     //Create Sirius's medium sky map - no longer needed, final result is image
            //     createMap(opts_data, 0, 500, 500, "#chart-sirius", focus_sirius, "medium")
            // })
            // .then(() => {
            //     //Create the Big Dipper's medium sky map - no longer needed, final result is image
            //     createMap(opts_data, 0, 500, 500, "#chart-big-dipper", focus_big_dipper, "medium")
            // })
            // .then(() => {
            //     //Doesn't actually create canvases, only loads final png images now
            //     createSmallMultipleLayout(opts_data, "canvas")
            // })
            .then(() => {
                //Create the general full Sky Map visual - now creates only the lines and uses that as a background image
                createStraightSkyMapLayout(opts_data, focus_culture, 650, "constellations")
                // //The full canvas version
                // createStraightSkyMapLayoutFullCanvas(opts_data, focus_culture, window.innerWidth, 1.5, 650, "constellations")
            })
    }//function breathableConcat

    breathableConcat()

}//function setupStarMaps


function createStatChartStars(map_id, stars) {

    ////////////////////////////// Set sizes ///////////////////////////////
    let total_width = document.getElementById("chart-" + map_id).offsetWidth - 2 * 20
    let margin = { left: 40, top: 60, right: 200, bottom: 40 }
    // let margin = { left: 0, top: 0, right: 200, bottom: 40 }
    let width = total_width - margin.left - margin.right
    let total_height = Math.round(width * 0.8)
    let height = total_height - margin.top - margin.bottom

    ////////////////////////////// Create canvas ///////////////////////////////
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", "canvas-" + map_id)
        .attr("class", "canvas-circular")
        .style("z-index", -1)
        .style("pointer-events", "none")
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 0)
    ctx.translate(margin.left, margin.top)

    ////////////////////////////// Create svg ///////////////////////////////
    const svg = d3.select("#chart-" + map_id).append("svg")
        .attr("id", "svg-" + map_id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    ////////////////////////////// Create scales ///////////////////////////////
    Math.seedrandom('a13219765bc7c488a3a47') //Produce the same results always
    // const y_jitter = d3.randomUniform(-0.5, 0.5)
    const y_jitter = d3.randomUniform(-0.01, 0.01)

    const x_scale = d3.scaleLinear() //mag
        .domain([6.5, -1.5])
        .range([0, width])

    const y_scale = d3.scaleLinear() //number of constellations
        .domain([0, 35])
        .range([height, 0])

    const r_scale = d3.scaleSqrt()
        .domain([10, -15])
        .range([1, 5])
        .clamp(true)

    ////////////// Add voronoi hover //////////////

    const voronoi = d3.voronoi()
        // .extent([[0,0], [width, height]])
        .x(d => x_scale(d.mag))
        .y(d => y_scale(d.constellations))

    let diagram = voronoi(stars)

    function moved() {
        let m = d3.mouse(this)
        let found = diagram.find(m[0], m[1], 5)
        if(found) {
            found = found.data
            console.log(found.hip, found.proper, found.mag, found.constellations, found.absmag)

            if(found.proper !== "") star_name.text("That's " + focus.proper)
            else star_name.text("No 'fancy' star name known")

            star_hip_id.text("HIP id: " + focus.hip)
            star_constellation.text("Found in the constellation area of" + focus.constellation)

        }//if
    }//function moved

    //Add rect that will capture the mouse event
    svg.append("rect")
        .attr("class", "hover-rect")
        .attr("x", -margin.left)
        .attr("y", -margin.top)
        .attr("width", total_width)
        .attr("height", total_height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", moved)

    //Create an info group to show on hover
    let info_group = svg.append("g").attr("class", "info-group")
        .attr("transform", "translate(" + [width, height - 200] + ")")

    // let star_name = info_group.append("text")
    //     .attr("id", "info-group-star-name")
    //     .attr("class", "info-group-text")
    //     .attr("y", 0)
    //     .attr("dy", "0.35em")
    //     .text("That's Betelgeuse")

    // let star_hip_id = info_group.append("text")
    //     .attr("id", "info-group-star-hip-id")
    //     .attr("class", "info-group-text")
    //     .attr("y", 20)
    //     .attr("dy", "0.35em")
    //     .text("HIP id: 409913")

    //constellation area

    ////////////////////////////// Create color scale ///////////////////////////////
    var star_colors_yor = ["#F6E153", "#EFB605", "#F7980C", "#F2691B", "#E6330A", "#D3351D", "#AC3D5A", "#5A4D6E"]
    var star_temperatures_yor = [6510, 6000, 5000, 4000, 3000, 2000, 1000, 500]
    var color_scale_yor = chroma.scale(star_colors_yor)
        .domain(star_temperatures_yor)

    //To not get any green colors, make a separate color scale for blue
    var star_colors_blue = ["#111E85","#145AA3","#63A9C1", "#A5D1DD", "#d0f0f9"]
    var star_temperatures_blue = [30000, 20000, 10000, 8000, 6511]

    var color_scale_blue = chroma.scale(star_colors_blue)
        .domain(star_temperatures_blue)
        .mode('lch')
        .correctLightness()

    ////////////// Create circles //////////////

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = "multiply"
    ctx.shadowBlur = 4

    stars.forEach(d => {
        if(d.constellations === 0 || d.mag > 6.5) return

        let x = x_scale(d.mag)
        let y = y_scale(d.constellations + y_jitter())
        let r = r_scale(d.absmag)

        let col = "white"
        if(d.t_eff) {
            let color_scale = d.t_eff > 6510 ? color_scale_blue : color_scale_yor
            col = color_scale(d.t_eff)
        }//if
        ctx.fillStyle = col
        //Create a glow around each star
        ctx.shadowColor = col

        //Draw the circle
        ctx.beginPath()
        ctx.arc(x, y, r, 0, pi2)
        ctx.closePath()
        ctx.fill()
    })

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0

    ////////////// Create axes //////////////

    let x_axis = svg.append("g") //x scale - mag
        .attr("class", "axis x")
        .attr("transform", "translate(0 " + height + ")")
        .call(d3.axisBottom(x_scale)
            .ticks(10))
    x_axis.selectAll(".tick").remove()

    let y_axis = svg.append("g") //y scale - num constellations
        .attr("class", "axis y")
        .call(d3.axisLeft(y_scale).ticks(4))
    y_axis.selectAll("path").remove()

    ////////////// Create titles //////////////

    //Add x title
    x_axis.selectAll(".chart-stats-axis-title")
        .data(["Fainter stars","Brighter stars"])
        .enter().append("text")
        .attr("class", "chart-stats-axis-title")
        .attr("x", (d,i) => width * (i === 0 ? 0.075 : 0.925) )
        .attr("y", 18)
        .style("text-anchor", "middle")
        .text(d => d)

    //Add y title
    y_axis.append("text")
        .attr("class", "chart-stats-axis-title")
        .attr("x", -20)
        .attr("y", 15)
        .attr("text-anchor","start")
        .text("No. of")
    y_axis.append("text")
        .attr("class", "chart-stats-axis-title")
        .attr("x", -20)
        .attr("y", 27)
        .attr("text-anchor","start")
        .text("constellations")

    ////////////// Add annotations //////////////

    const annotationData = [
        {
            className: "orion-note",
            note: {
                title: "Orion's belt",
                label: "The 3 stars that make up 'Orion's belt' are used in a constellation across most cultures. Some even more than once", 
                wrap: 200 
            },
            data: {mag: 1.95, constellations: 32.3},
            type: d3.annotationCalloutCircle,
            dy: -1,
            dx: 80,
            subject: {
                radius: 45,
                radiusPadding: 5
            }
        },
        {
            className: "orion-note",
            note: {
                label: "Betelgeuse and Rigel, Orion's two bright corner stars", 
                wrap: 180,
                padding: 0
            },
            data: {mag: 0.315, constellations: 17.5},
            type: d3.annotationCalloutCircle,
            dy: -60,
            dx: 40,
            subject: {
                radius: 28,
                radiusPadding: 5
            }
        },
        // {
        //     className: "Aldebaran-note circle-hide",
        //     note: {
        //         label: "Aldebaran",
        //         padding: 0
        //     },
        //     data: {mag: 0.87, constellations: 23},
        //     type: d3.annotationCalloutCircle,
        //     dy: -20,
        //     dx: 20,
        //     subject: {
        //         radius: 8,
        //         radiusPadding: 0
        //     }
        // },
        {
            className: "Dubhe-note circle-hide",
            note: {
                label: "Dubhe",
                padding: 0
            },
            data: {mag: 1.81, constellations: 20},
            type: d3.annotationCalloutCircle,
            dy: -15,
            dx: 15,
            subject: {
                radius: 8,
                radiusPadding: 0
            }
        },
        {
            className: "sirius-note circle-hide",
            note: {
                title: "Sirius",
                label: "The brightest star isn't used in constellations often; perhaps it needed brighter companion stars",
                wrap: 160 
            },
            data: {mag: -1.44, constellations: 12.05},
            type: d3.annotationCalloutCircle,
            dy: -20,
            dx: 30,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {
                title: "Pleiades",
                label: "These 9 tightly packed stars are used in constellations more often than expected for their brightness. Most likely due to their ease of recognition", 
                wrap: 230 
            },
            data: {mag: 2.85, constellations: 19},
            type: d3.annotationCalloutCircle,
            dy: -75,
            dx: -40,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 5.76, constellations: 8},
            type: d3.annotationCalloutCircle,
            dy: -208,
            dx: 0,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 5.45, constellations: 8},
            type: d3.annotationCalloutCircle,
            dy: -208,
            dx: 0,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 5.05, constellations: 7},
            type: d3.annotationCalloutCircle,
            dy: -221,
            dx: -15,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 3.87, constellations: 9},
            type: d3.annotationCalloutCircle,
            dy: -195,
            dx: -80,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 4.3, constellations: 18},
            type: d3.annotationCalloutCircle,
            dy: -81,
            dx: -15,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },
        {
            className: "pleiades-note circle-hide",
            note: {label: "" },
            data: {mag: 4.14, constellations: 20},
            type: d3.annotationCalloutCircle,
            dy: -55,
            dx: 0,
            subject: {
                radius: 10,
                radiusPadding: 0
            }
        },

        {
            className: "pleiades-note",
            note: {label: ""},
            data: {mag: 3.67, constellations: 22},
            type: d3.annotationCalloutCircle,
            dy: -30,
            dx: -20,
            subject: {
                radius: 15,
                radiusPadding: 4
            }
        },
    ]

    //Set-up the annotation
    const makeAnnotations = d3.annotation()
        // .editMode(true)
        .accessors({
            x: d => x_scale(d.mag),
            y: d => y_scale(d.constellations)
        })
        .notePadding(3)
        .annotations(annotationData)

    //Create the annotation
    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}//function createStatChartStars



function createStatChartCultures(map_id, m, w, h, cultures) {

    ////////////////////////////// Set sizes ///////////////////////////////
    let margin = { left: 70, top: m, right: 10, bottom: m }
    let width = w
    let height = h
    // let total_width = margin.left + width + margin.right
    // let total_height = margin.top + height + margin.bottom

    ////////////////////////////// Create svg ///////////////////////////////
    const svg = d3.select("#chart-" + map_id).append("svg")
        .attr("id", "svg-" + map_id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    ////////////////////////////// Create scales ///////////////////////////////
    let x_scale = d3.scaleLinear()
        .domain([0, 25])
        .rangeRound([0, width])

    let y_scale = d3.scaleBand()
        .domain(culture_names.map(d => constellationCultureCap(d)))
        .rangeRound([0, height])
        .padding(0.1)

    ////////////// Create axes //////////////

    let x_axis = svg.append("g") //x scale - the average
        .attr("class", "axis x")
        .attr("transform", "translate(0 " + height + ")")
        .call(d3.axisBottom(x_scale).ticks(3))
    
    let y_axis = svg.append("g") //y scale - cultures
        .attr("class", "axis y")
        .call(d3.axisLeft(y_scale))
    y_axis.selectAll(".tick line, path").remove()

    ////////////// Create bars //////////////

    svg.selectAll(".bar")
        .data(d3.values(cultures))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y_scale(constellationCultureCap(d.culture)))
        .attr("width", d => x_scale(d.mean_stars))
        .attr("height", y_scale.bandwidth())
        .style("fill", d => d.color)

}//function createStatChartCultures


////////////////// Return projected coordinates //////////////////
function pixelPos(ra, dec, projection) { return projection([-ra * (360/24), dec]) }

////////////////// Get the base constellation name from the id //////////////////
function constellationCulture(s) {
    let n = s.indexOf("-")
    s = s.substring(0, n != -1 ? n : s.length)
    return s
}//function constellationCulture

////////////////// Returns the Capitalized culture of the constellation //////////////////
function constellationCultureCap(s) {
    let n = constellationCulture(s)
    //Replace _ by space
    n = n.replace(/_/g, ' ')
    //Capitalize first letter
    n = n.charAt(0).toUpperCase() + n.slice(1)
    return n
}//function constellationCultureCap

///////////////////////////////////////////////////////////////////////////
//////////////////////// General helper functions /////////////////////////
///////////////////////////////////////////////////////////////////////////

////////////////// Retina non-blurry canvas //////////////////
function crispyCanvas(canvas, ctx, total_width, total_height, offscreen, offset_x) {
    sf = Math.min(2, getPixelRatio(ctx)) //no more than 2
    if(screen.width < 500) sf = 1 //for small devices, 1 is enough

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
    if(offset_x) ctx.translate(offset_x, 0)
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

////////////////// Capitalize first letter of each word //////////////////
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}//toTitleCase