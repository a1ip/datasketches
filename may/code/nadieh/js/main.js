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
let culture_names = []
for(culture in cultures) culture_names.push(culture)

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

    ///////////////////////////////////////////////////////////////////////////
    //////////////////////// Create Statistical chart /////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    createStatChartStars("stats-stars", 30, 600, 450, stars)
    createStatChartCultures("stats-cultures", 10, 330, 450, cultures)

    ////////////////////////// Culture rectangular sky map //////////////////////////
    chosen_culture = "hawaiian_starlines"
    // chosen_culture = culture_names[Math.floor(Math.random() * culture_names.length)]
    let focus_culture = {
        culture: chosen_culture,
        center: [0, 0], //ra in hours dec in degrees
        scale: 250,
    }

    d3.selectAll(".chosen-culture-title")
        .style("color", cultures[chosen_culture].color)
        .html(toTitleCase(chosen_culture.replace(/_/g, ' ')))
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


function createStatChartStars(map_id, m, w, h, stars) {

    ////////////////////////////// Set sizes ///////////////////////////////
    let margin = { left: m, top: m, right: m, bottom: m }
    let width = w
    let height = h
    let total_width = margin.left + width + margin.right
    let total_height = margin.top + height + margin.bottom

    ////////////////////////////// Create canvas ///////////////////////////////
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", "canvas-" + map_id)
        .attr("class", "canvas-circular")
        .style("z-index", 2)
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

    ////////////////////////////// Create svg ///////////////////////////////
    const x_jitter = d3.randomUniform(-0.2, 0.2)
    const y_jitter = d3.randomUniform(-0.5, 0.5)

    const x_scale = d3.scaleLinear() //mag
        .domain([6.5, -1.5])
        .range([0, width])

    const y_scale = d3.scaleLinear() //number of constellations
        .domain([0, 35])
        .range([height, 0])

    const r_scale = d3.scaleSqrt()
        .domain([10, -15])
        .range([0, 5])
        .clamp(true)

    // //Colors of the stars based on their effective temperature
    // //https://gka.github.io/chroma.js/
    // const star_colors = ["#9db4ff","#aabfff","#cad8ff","#fbf8ff","#fff4e8","#ffddb4","#ffbd6f","#f84235","#AC3D5A","#5A4D6E"]
    // const star_temperatures = [30000,20000,8500,6800,5600,4500,3000,2000,1000,500]
    // const star_color_scale = chroma
    //     .scale(star_colors)
    //     .domain(star_temperatures)

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
    ctx.shadowBlur = 8

    stars.forEach(d => {
        if(d.constellations === 0 || d.mag > 6.5) return

        let x = x_scale(d.mag + x_jitter())
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
            .ticks(2))
    x_axis.selectAll(".tick").remove()

    let y_axis = svg.append("g") //y scale - num constellations
        .attr("class", "axis y")
        .call(d3.axisLeft(y_scale)
            .ticks(5)
            //.tickFormat(d3.format("$,.0s"))
        )
    y_axis.selectAll("path").remove()

    ////////////// Create titles //////////////

    //Add chart title
    svg.append("text")
        .attr("class", "chart-stats-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .text("Explanatory chart title")

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
        // .attr("x", 0)
        // .attr("y", 50)
        .attr("transform", `translate(15,0)rotate(-90)`)
        .text("No. of constellations")

}//function createStatChartStars



function createStatChartCultures(map_id, m, w, h, cultures) {

    ////////////////////////////// Set sizes ///////////////////////////////
    let margin = { left: m, top: m, right: m, bottom: m }
    let width = w
    let height = h
    let total_width = margin.left + width + margin.right
    let total_height = margin.top + height + margin.bottom

    // ////////////////////////////// Create canvas ///////////////////////////////
    // const canvas = d3.select("#chart-" + map_id).append("canvas")
    //     .attr("id", "canvas-" + map_id)
    //     .attr("class", "canvas-circular")
    //     .style("z-index", 2)
    // const ctx = canvas.node().getContext("2d")
    // crispyCanvas(canvas, ctx, total_width, total_height, 0)
    // ctx.translate(margin.left, margin.top)

    ////////////////////////////// Create svg ///////////////////////////////
    const svg = d3.select("#chart-" + map_id).append("svg")
        .attr("id", "svg-" + map_id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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
    sf = 2 //Math.min(2, getPixelRatio(ctx)) //no more than 2
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