//TODO: Don't use basemap size, but actual final size (use type to figure it out)

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Constants ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

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

const font_family = "Glass Antiqua"
// const font_family = "Cormorant"

//All cultures and their colors
const cultures = []
cultures["arabic"] = {culture: "arabic", color: "#EFB605", count: 49}
cultures["arabic_moon_stations"] = {culture: "arabic_moon_stations", color: "#EBAF02", count: 28}
cultures["aztec"] = {culture: "aztec", color: "#E8A400", count: 5}
cultures["belarusian"] = {culture: "belarusian", color: "#E69201", count: 20}
cultures["boorong"] = {culture: "boorong", color: "#E47607", count: 28}
cultures["chinese"] = {culture: "chinese", color: "#E45311", count: 318}
cultures["dakota"] = {culture: "dakota", color: "#E3301C", count: 13}
cultures["egyptian"] = {culture: "egyptian", color: "#DF1428", count: 28}
cultures["hawaiian_starlines"] = {culture: "hawaiian_starlines", color: "#D80533", count: 13}
cultures["indian"] = {culture: "indian", color: "#CE003D", count: 28}
cultures["inuit"] = {culture: "inuit", color: "#C30048", count: 11}
cultures["japanese_moon_stations"] = {culture: "japanese_moon_stations", color: "#B80452", count: 28}
cultures["kamilaroi"] = {culture: "kamilaroi", color: "#AC0C5E", count: 13}
cultures["korean"] = {culture: "korean", color: "#9F166A", count: 272}
cultures["macedonian"] = {culture: "macedonian", color: "#932278", count: 19}
cultures["maori"] = {culture: "maori", color: "#852F87", count: 6}
cultures["mongolian"] = {culture: "mongolian", color: "#763C95", count: 4}
cultures["navajo"] = {culture: "navajo", color: "#644AA0", count: 8}
cultures["norse"] = {culture: "norse", color: "#4F56A6", count: 6}
cultures["ojibwe"] = {culture: "ojibwe", color: "#3963A7", count: 10}
cultures["romanian"] = {culture: "romanian", color: "#2570A2", count: 39}
cultures["sami"] = {culture: "sami", color: "#148097", count: 10}
cultures["sardinian"] = {culture: "sardinian", color: "#0A9087", count: 11}
cultures["siberian"] = {culture: "siberian", color: "#099E77", count: 3}
cultures["tongan"] = {culture: "tongan", color: "#17AA69", count: 11}
cultures["tukano"] = {culture: "tukano", color: "#31B15F", count: 11}
cultures["tupi"] = {culture: "tupi", color: "#55B558", count: 7}
cultures["western"] = {culture: "western", color: "#7EB852", count: 88}

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

    ////////////////////////// Big Dipper medium map //////////////////////////
    let focus_big_dipper = {
        hip: 54061,
        proper: "Dubhe",
        title_position: "top-left",
        center: [12.3, 56],
        scale: 2200,
    } //11: navajo-001 is a good one & 19: wester-UMa

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////// Create Small multiples //////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////
    //////////////////////// Create Statistical chart /////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    ////////////////////////// Culture rectangular sky map //////////////////////////
    chosen_culture = "hawaiian_starlines"
    // chosen_culture = culture_names[Math.floor(Math.random() * culture_names.length)]
    let focus_culture = {
        culture: chosen_culture,
        center: [0, 0], //ra in hours dec in degrees
        scale: 250,
    }

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Run all the functions //////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    function breathableConcat() {
        return breathe.chain()   // creates a breathable chain
            .then(() => {
                //Create the Sky Map behind the header
                createStraightSkyMapLayout(opts_data, focus_header, window.innerWidth, 1.5, 500, "header")
            })
            .then(() => {
                //Create Orion's big circular layout
                createCentralCircleLayout(opts_data, focus_betelgeuse, 20, 920, 920, "orion")
            })
            .then(() => {
                //Create Sirius's small sky map
                createMap(opts_data, 0, 500, 500, "#chart-sirius", focus_sirius, "medium")
            })
            .then(() => {
                //Create the Big Dipper's small sky map
                createMap(opts_data, 0, 500, 500, "#chart-big-dipper", focus_big_dipper, "medium")
            })
            .then(() => {
                //Create the small multiple collection
                createSmallMultipleLayout(opts_data)
            })
            .then(() => {
                //Create the general full Sky Map visual
                createStraightSkyMapLayout(opts_data, focus_culture, window.innerWidth, 1.5, 650, "constellations")
                //Update the title
                d3.selectAll(".chosen-culture-title")
                    .style("color", cultures[chosen_culture].color)
                    .html(toTitleCase(chosen_culture.replace(/_/g, ' ')))
                //Set the colors on the culture divs
                setCultureDivColors(chosen_culture)
            })
    }//function breathableConcat

    breathableConcat()

}//function setupStarMaps

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
    let sf = Math.min(2, getPixelRatio(ctx)) //no more than 2
    if(screen.width < 500) sf = 1 //for small devices, 1 is enough
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