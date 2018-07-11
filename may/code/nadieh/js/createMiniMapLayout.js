function createSmallMultipleLayout(opts_data) {
    let focus = []

    ////////////////////////////// List of stars ///////////////////////////////

    focus.push({
        hip: 60718,
        proper: "Acrux",
        note: "Located in the Southern Cross, quite near the South Pole",
        title_position: "bottom-left",
        center: [12.443311, -60],
        scale: 6000,
    })

    // focus.push({
    //     hip: 21421,
    //     proper: "Aldebaran",
    //     title_position: "bottom-left",
    //     note: "After Orion's 'belt' this star is used across most cultures",
    //     center: [4.5, 18],
    //     scale: 3000,
    // })

    focus.push({
        hip: 76267,
        proper: "Alphekka",
        title_position: "bottom-right",
        note: "A great number of things can be seen in a half circular shape",
        center: [15.7,29],
        scale: 3800,
    })

    // //Really not
    // focus.push({
    //     hip: 109268,
    //     proper: "Alnair",
    //     title_position: "top-left",
    //     note: "Test",
    //     center: [22.1, -47],
    //     scale: 2800,
    // })

    // //Really not
    // focus.push({
    //     hip: 97649,
    //     proper: "Altair",
    //     title_position: "top-left",
    //     note: "Easiest to find as the bottom of the 'Summer Triangle'",
    //     center: [19.8, 8.9],
    //     scale: 2800,
    // })

    focus.push({
        hip: 35904,
        proper: "Aludra",
        title_position: "bottom-right",
        note: "Aludra shines more than 100,000 times brighter than the Sun",
        center: [6.9, -27],
        scale: 1900,
    })

    focus.push({
        hip: 80763,
        proper: "Antares",
        title_position: "top-left",
        note: "A very red star known by many cultures as 'The Heart'",
        center: [16.75, -33],
        scale: 2100,
    })

    // focus.push({
    //     hip: 69673,
    //     proper: "Arcturus",
    //     title_position: "bottom-right",
    //     note: "Often used as a single star 'constellation'",
    //     center: [14.3, 31],
    //     scale: 1900,
    // })

    focus.push({
        hip: 27989,
        proper: "Betelgeuse",
        title_position: "bottom-left",
        note: "The red super-giant star of Orion's shoulder",
        center: [5.603559, 3.20192],
        scale: 1950,
    })

    focus.push({
        hip: 24608,
        proper: "Capella",
        title_position: "top-left",
        note: "Known as 'the Goat star' in several cultures",
        center: [5.5, 39],
        scale: 2400,
    })

    focus.push({
        hip: 102098,
        proper: "Deneb",
        title_position: "top-right",
        note: "Part of both the Swan & the 'Summer Triangle'",
        center: [20.37047, 40.25668],
        scale: 1700,
    })

    focus.push({
        hip: 54061,
        proper: "Dubhe",
        title_position: "top-left",
        note: "Found in the Big Dipper, which belongs to the Big Bear",
        center: [12.3, 56],
        scale: 2200,
    })

    // //Really not
    // focus.push({
    //     hip: 90185,
    //     proper: "KausAustralis",
    //     title_position: "top-left",
    //     note: "Test",
    //     center: [18.4, -30],
    //     scale: 2200,
    // })

    focus.push({
        hip: 15863,
        proper: "Mirphak",
        title_position: "top-left",
        note: "Ascribed to fascinating animal shapes in several cultures",
        center: [3.4, 50],
        scale: 3000,
    })

    focus.push({
        hip: 11767, 
        proper: "Polaris",
        note: "The famous North (Pole) star and part of the Little Dipper",
        title_position: "bottom-right",
        center: [12, 85],
        scale: 2200,
    })

    focus.push({
        hip: 37826,
        proper: "Pollux",
        title_position: "bottom-left",
        note: "The 'heavenly twins' of Gemini & the Zodiac sign",
        center: [7.1, 25],
        scale: 2400,
    })

    focus.push({
        hip: 49669,
        proper: "Regulus",
        title_position: "top-right",
        note: "The brightest star (actually 4 stars together) of the Lion",
        center: [10.6,19],
        scale: 2000,
    })

    focus.push({
        hip: 32349,
        proper: "Sirius",
        title_position: "top-right",
        note: "The brightest star of the night sky, part of the Large Dog",
        center: [6.752481, -21],
        scale: 2600,
    })

    // //Really not
    // focus.push({
    //     hip: 65474,
    //     proper: "Spica",
    //     title_position: "bottom-left",
    //     note: "The brightest star of the Zodiac constellation Virgo, the Maiden",
    //     center: [13.419883, -4],
    //     scale: 1200,
    // })

    ////////////////////////////// Draw small multiples ///////////////////////////////

    let m = 0
    let size = window.innerWidth < 1200 ? 180 : 200
    let colors = ["#EFB605","#E7A000","#E4650B","#E01A25","#CE003D","#B50655","#991C71","#7A3992","#4F56A6","#2074A0","#08977F","#2AAF61","#7EB852"]

    //Loop over each star and draw the mini map
    breathe.times(focus.length, i => {
        let p_name = focus[i].proper.toLowerCase()
        let chart_id = "div-" + p_name
        //Create a div to put this in
        const chart_group = d3.select("#chart-container-small-multiple").append("div")
            .attr("id", chart_id)
            .attr("class", "div-group-small-multiple")
            .style("color", colors[i])

        //Add star's title on top
        chart_group.append("p")
            .attr("class", "small-multiple-chart-title")
            .html(focus[i].proper)
        //Add note about the star/constellation
        chart_group.append("p")
            .attr("class", "small-multiple-chart-sub-title red")
            .html(focus[i].note)

        //Add image of small multiple
        let chart_div = chart_group.append("div")
            .datum(focus[i])
            .attr("id", "div-small-multiple-" + p_name)
            .attr("class", "div-small-multiple")
            .style("width", size + "px")
            .style("height", size + "px")
            .style("background-image", `url("img/small-multiple/small-multiple-${p_name}-2x-min.png")`)

        //Make it clickable
        chart_div.on("click", d => smallMapClick(d, opts_data))

        // //Draw the canvas instead
        //createMap(opts_data, m, size, size, "#" + chart_id, focus[i], "multiple")
    })//breathe focus

}//function createSmallMultipleLayout

function createMap(opts_data, m, w, h, container_id, focus, type) {
    ////////////////////////////// Set sizes ///////////////////////////////
    let margin = { left: m, top: m, right: m, bottom: m }
    let width = w
    let height = h
    let total_width = margin.left + width + margin.right
    let total_height = margin.top + height + margin.bottom

    ////////////////////////////// Create canvas ///////////////////////////////
    const canvas = d3.select(container_id).append("canvas")
        .attr("id", "canvas-" + type + "-" + focus.proper.toLowerCase())
        .attr("class", "canvas-circular canvas-small-multiple")
        .datum(focus)
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 0)

    ////////////////////////////// Create sky map ///////////////////////////////

    //Get all of the constellations that include the chosen star
    let constellations = const_per_star
        .filter(d => d.star_id === focus.hip)
        .map(d => d.const_id)
        .sort()

    let chosen_const = constellations
    let location = {
        x: margin.left,
        y: margin.top,
        width: width,
        height: height
    }

    ////////////////////////////// Possible down-scaling for anti-alias ///////////////////////////////

    //Downscale in steps
    if(type === "multiple" && sf < 2) {
        // Get the original constellation line canvas
        const basemap = createCircularBaseMap(opts_data, focus, chosen_const, type)
        let new_size = basemap_total_size / 2
        let new_canvas = drawToTemp(basemap, new_size, "origin")

        new_size = new_size / 2
        ctx.drawImage(new_canvas, location.x, location.y, location.width, location.height)

        //Down-scaling in steps to reduce anti-aliasing
        //Based on https://stackoverflow.com/a/17862644/2586314
        function drawToTemp(canvas, size) {
            let canvas_temp = document.createElement('canvas') //offscreen canvas
            let ctx_temp = canvas_temp.getContext('2d')
            canvas_temp.width = size
            canvas_temp.height = size
            ctx_temp.drawImage(canvas.canvas_space, 0, 0, canvas_temp.width, canvas_temp.height)
            ctx_temp.drawImage(canvas.canvas_stars, 0, 0, canvas_temp.width, canvas_temp.height)
            ctx_temp.drawImage(canvas.canvas_lines, 0, 0, canvas_temp.width, canvas_temp.height)

            return canvas_temp
        }//function drawToTemp
    } else {
        drawMap(opts_data, canvas, ctx, focus, chosen_const, location, type)
    }//else

    ////////////////////////////// Add interactivity ///////////////////////////////

    //Make it clickable
    canvas.on("click", d => smallMapClick(d, opts_data))
}//function createMap

//When clicking on this div, the visual scrolls to Orion and changes the map there to show the chosen star
function smallMapClick(d, opts_data) {
    d3.select("#betelgeuse-note").style("display", d.proper === "Betelgeuse" ? "none" : "inline")

    //Fade in the group to hide the map and remove some elements from the Orion map
    d3.selectAll("#canvas-orion, #canvas-mini-orion, #svg-orion .chart-circular-title-group, #svg-orion .chart-circular-mini-map-circle").remove()
    const fade_group = d3.select("#svg-orion .chart-circular-hide-group")
        .style("opacity", 1)
    fade_group.select(".chart-circular-text-name")
        .text(d.proper)
    fade_group.select(".chart-circular-text-culture")
        .text("")

    //Scroll to the original Orion chart
    document.querySelector("#section-chart-orion").scrollIntoView({
        behavior: "smooth",
        block: "center"
    })
    // const section = document.getElementById("section-chart-orion")
    // window.scrollBy({
    //     top: section.getBoundingClientRect().top - 20, 
    //     left: 0, 
    //     behavior: "smooth"
    // })

    //Create the new layout, but wait a bit for the visual to have scrolled up
    setTimeout(() => {
        createCentralCircleLayout(opts_data, d, orion_m, orion_size, orion_size, "orion")
    }, 1100)
}//function smallMapClick