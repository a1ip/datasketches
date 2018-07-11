function createSmallMultipleLayout(opts_data) {
    let focus = []

    focus.push({
        hip: 27989,
        proper: "Betelgeuse",
        title_position: "bottom-left",
        note: "The red super-giant of Orion's shoulder",
        center: [5.603559, 3.20192],
        scale: 1950,
    })

    //Swan -> Cygnus: Central star Sadr
    focus.push({
        // hip: 91262, //Vega
        // hip: 97649, //Altair
        hip: 102098,
        proper: "Deneb",
        title_position: "top-right",
        note: "Part of both the Swan & the 'Summer Triangle'",
        center: [20.37047, 40.25668],
        scale: 1700, //1300,
    })

    // focus.push({
    //     hip: 97649,
    //     proper: "Altair",
    //     note: "The bottom of the 'Summer Triangle'",
    //     title_position: "top-left",
    //     center: [19.846388, 8.868322],
    //     scale: 2700,
    // })

    //Southern cross
    focus.push({
        hip: 60718,
        proper: "Acrux",
        note: "Located in the Southern Cross",
        title_position: "bottom-left",
        center: [12.443311, -60],
        scale: 6000,
    })

    //The North, slightly offset
    focus.push({
        hip: 11767, 
        // hip: 67301,
        proper: "Polaris",
        note: "The famous North (Pole) star",
        title_position: "top-right",
        center: [12, 85],
        scale: 2200,
    })

    focus.push({
        hip: 65474,
        proper: "Spica",
        title_position: "bottom-left",
        note: "Orion",
        center: [13.419883, -4],
        scale: 1200,
    })

    focus.push({
        hip: 80763,
        proper: "Antares",
        title_position: "top-left",
        note: "A very red star known as 'The Heart'",
        center: [16.75, -33],
        scale: 2100,
    })

    focus.push({
        hip: 37826,
        proper: "Pollux",
        title_position: "bottom-left",
        note: "The 'heavenly twins' of Gemini",
        center: [7.1, 25],
        scale: 2400,
    })

    focus.push({
        hip: 32349,
        proper: "Sirius",
        title_position: "top-right",
        note: "The brightest, part of the Large Dog",
        center: [6.752481, -21],
        scale: 2600,
    })

    focus.push({
        hip: 54061,
        proper: "Dubhe",
        title_position: "top-left",
        note: "Found in the Big Dipper (or Ursa Major)",
        center: [12.3, 56],
        scale: 2200,
    })

    let m = -10
    let size = 220
    breathe.times(focus.length, i => {
        let p_name = focus[i].proper.toLowerCase()
        let chart_id = "div-" + p_name
        //Create a div to put this in
        const chart_group = d3.select("#chart-container-small-multiple").append("div")
            .attr("id", chart_id)
            .attr("class", "div-group-small-multiple")

        chart_group.append("p")
            .attr("class", "small-multiple-chart-title")
            .html(focus[i].proper)

        chart_group.append("p")
            .attr("class", "small-multiple-chart-sub-title red")
            .html(focus[i].note)

        // //Create SVG for the title
        // const svg = chart_group.append("svg")
        //     .attr("id", "svg-" + p_name)
        //     .attr("class", "svg-circular svg-small-multiple")
        //     .attr("width", size + 2 * m)
        //     .attr("height", size + 2 * m)

        // svg.append("path")
        //     .attr("class", "small-multiple-path")
        //     .attr("id", p_name + "-path")
        //     .attr("d", "M" + [size/2 + m, size + 2 * m] + " A " + [size/2 * 0.98, size/2 * 0.98] + " 0 1 1 " + [size/2 + m + 0.01, size + 2 * m])

        // svg.append("text")
        //     .attr("class", "small-multiple-chart-title")
        //     .append("textPath")
        //     .attr("xlink:href", `#${p_name}-path`)
        //     .attr("startOffset", "50%")
        //     .text(focus[i].proper)



        // svg.append("path")
        //     .attr("class", "small-multiple-path")
        //     .attr("id", p_name + "-path-sub")
        //     .attr("d", "M" + [size/2 + m, 0] + " A " + [size/2, size/2] + " 0 1 0 " + [size/2 + m + 0.01, 0])

        // // let const_id = opts_data.const_per_star.filter(d => d.star_id === focus[i].hip && d.const_culture === "western")[0].const_id
        // // let const_name = opts_data.const_names[opts_data.const_names.map(c => c.const_id).indexOf(const_id)].const_name
        // svg.append("text")
        //     .attr("class", "small-multiple-chart-sub-title")
        //     .attr("dy", "0.5em")
        //     .append("textPath")
        //     .attr("xlink:href", `#${p_name}-path-sub`)
        //     .attr("startOffset", "50%")
        //     .text(focus[i].note)

        //Draw the canvas
        createMap(opts_data, m, size, size, "#" + chart_id, focus[i], "multiple")
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
        .attr("id", "canvas-" + focus.proper.toLowerCase())
        .attr("class", "canvas-circular canvas-small-multiple")
        .datum(focus)
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 0)

    // d3.select(container_id).append("p")
    //     .attr("class", "small-multiple-chart-sub-title red")
    //     .html(focus.note)

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
    if(type === "multiple") {
        let new_size, new_canvas
        // Get the original constellation line canvas
        const basemap = createCircularBaseMap(opts_data, focus, chosen_const, type)
        new_size = basemap_total_size / 2
        new_canvas = drawToTemp(basemap, new_size, "origin")
        new_size = new_size / 2
        new_canvas = drawToTemp(new_canvas, new_size, "copy")
        ctx.drawImage(new_canvas, 0, 0, new_size, new_size, location.x, location.y, location.width, location.height)

        //Down-scaling in steps to reduce anti-aliasing
        //Based on https://stackoverflow.com/a/17862644/2586314
        function drawToTemp(canvas, size, type) {
            let canvas_temp = document.createElement('canvas') //offscreen canvas
            let ctx_temp = canvas_temp.getContext('2d')
            canvas_temp.width = size
            canvas_temp.height = size
            if(type === "origin") {
                ctx_temp.drawImage(canvas.canvas_space, 0, 0, canvas_temp.width, canvas_temp.height)
                ctx_temp.drawImage(canvas.canvas_stars, 0, 0, canvas_temp.width, canvas_temp.height)
                ctx_temp.drawImage(canvas.canvas_lines, 0, 0, canvas_temp.width, canvas_temp.height)
            } else {
                ctx_temp.drawImage(canvas, 0, 0, canvas_temp.width, canvas_temp.height)
            }//else

            return canvas_temp
        }//function drawToTemp

    } else {
        drawMap(opts_data, canvas, ctx, focus, chosen_const, location, type)
    }//else

    ////////////////////////////// Add interactivity ///////////////////////////////

    //Make it clickable
    d3.select("#canvas-" + focus.proper.toLowerCase()).on("click", d => {
        d3.select("#betelgeuse-note").style("display", d.proper === "Betelgeuse" ? "none" : "inline")
        // const section = document.getElementById("section-chart-orion")
        // window.scrollBy({
        //     top: section.getBoundingClientRect().top - 20, 
        //     left: 0, 
        //     behavior: "smooth"
        // })
        //Scroll to the original Orion chart
        document.querySelector("#section-chart-orion").scrollIntoView({ 
            behavior: "smooth",
            block: "center"
          });
        //Create the new layout
        setTimeout(() => {
            createCentralCircleLayout(opts_data, d, 20, 950, 950, "orion")
        }, 20)
    })

}//function createMap