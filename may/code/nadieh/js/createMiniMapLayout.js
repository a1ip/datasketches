function createSmallMultipleLayout(opts_data) {
    let focus = []

    focus.push({
        hip: 27989,
        proper: "Betelgeuse",
        center: [5.603559, 3.20192],
        scale: 1950,
    })

    //Swan -> Cygnus: Central star Sadr
    focus.push({
        // hip: 91262, //Vega
        hip: 102098,
        proper: "Deneb",
        // hip: 97649, //Altair
        center: [20.37047, 40.25668],
        scale: 1700, //1300,
    })

    focus.push({
        hip: 97649,
        proper: "Altair",
        center: [19.846388, 8.868322],
        scale: 2700,
    })

    //Southern cross
    focus.push({
        hip: 60718,
        proper: "Acrux",
        center: [12.443311, -60],
        scale: 6000,
    })

    focus.push({
        hip: 65474,
        proper: "Spica",
        center: [13.419883, -4],
        scale: 1200,
    })

    focus.push({
        hip: 80763,
        proper: "Antares",
        center: [16.75, -33],
        scale: 2100,
    })

    focus.push({
        hip: 37826,
        proper: "Pollux",
        center: [7.1, 25],
        scale: 2400,
    })

    focus.forEach(d => {
        createMap(opts_data, 10, 220, 220, "#chart-container-small-multiple", d, "multiple")
    })//forEach focus

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
        .attr("id", "canvas-" + focus.proper.toLowerCase())
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

    drawMap(opts_data, canvas, ctx, focus, chosen_const, location, type)

    ////////////////////////////// Add interactivity ///////////////////////////////

    //Make it clickable
    d3.select("#canvas-" + focus.proper.toLowerCase()).on("click", d => {
        d3.select("#betelgeuse-note").style("display", d.proper === "Betelgeuse" ? "none" : "inline")
        createCentralCircleLayout(opts_data, d, 20, 950, 950, "orion")
    })



    // let new_size, new_canvas

    // // Get the original constellation line canvas
    // const basemap = createCircularBaseMap(opts_data, focus, chosen_const, "big")
    // //Downscale in steps
    // new_size = basemap_total_size / 2
    // new_canvas = drawToTemp(basemap, new_size, "origin")
    // new_size = new_size / 2
    // new_canvas = drawToTemp(new_canvas, new_size, "copy")
    // ctx.drawImage(new_canvas, 0, 0, new_size, new_size, loc.x, loc.y, loc.width, loc.height)

    // //Down-scaling in steps to reduce anti-aliasing
    // //Based on https://stackoverflow.com/a/17862644/2586314
    // function drawToTemp(canvas, size, type) {
    //     let canvas_temp = document.createElement('canvas')
    //     let ctx_temp = canvas_temp.getContext('2d')
    //     canvas_temp.width = size
    //     canvas_temp.height = size
    //     if(type === "origin") {
    //         ctx_temp.drawImage(canvas.canvas_space, 0, 0, canvas_temp.width, canvas_temp.height)
    //         ctx_temp.drawImage(canvas.canvas_stars, 0, 0, canvas_temp.width, canvas_temp.height)
    //         ctx_temp.drawImage(canvas.canvas_lines, 0, 0, canvas_temp.width, canvas_temp.height)
    //     } else {
    //         ctx_temp.drawImage(canvas, 0, 0, canvas_temp.width, canvas_temp.height)
    //     }//else

    //     return canvas_temp
    // }//function drawToTemp
}//function createMap