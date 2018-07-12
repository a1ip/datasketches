function createStraightSkyMapLayout(opts, focus_map, h, map_id) {

    let chosen_culture = focus_map.culture
    let lines_div = document.getElementById(map_id + "-lines")
    let data_image

    ////////////////////////////// Set sizes ///////////////////////////////

    let margin = { top: 0, right: 0, bottom: 0, left: 0}
    let height = h
    let focus = JSON.parse(JSON.stringify(focus_map)) //Create deep clone

    /////////////////////////// Set-up projections ////////////////////////////

    //Plate carrée projection, see also: https://astronomy.stackexchange.com/questions/24709/
    const projection = d3.geoEquirectangular()
        .scale(focus.scale)
        .precision(0.1)
        .translate([0, height/2])
        //.rotate([focus.center[0] * 360/24, -1 * focus.center[1], 0])

    let proj_min = projection([-180,0])[0]
    let proj_max = projection([180,0])[0]
    let proj_width = Math.round(proj_max - proj_min)
    let width = proj_width

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

    ////////////////////////////// Create Canvases ///////////////////////////////

    //Create the canvas that's exactly as wide as a full projection
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", `canvas-${map_id}`)
        .attr("class", "canvas-rectangular")
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, width, height, 0)

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////// Create Sky maps /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    let opts_general = {
        chart_id: map_id,
        margin: margin,
        width: proj_width,
        height: height,
        offset_x: -proj_min,
        width_canvas: width,
        projection: projection,
        focus: focus,
        radius_scale: radius_scale,
        type_geo: "equirectangular"
    }

    /////////////////////// Constellations ////////////////////////
    let opts_lines = {
        chosen_culture: focus.culture,
        star_by_id: opts.star_by_id,
        const_links: opts.const_links
    }
    let canvas_lines = drawConstellationsSimple(opts_general, opts_lines, chosen_culture)

    //Draw the map on the canvas
    ctx.save()
    ctx.translate(-proj_min, 0)
    ctx.drawImage(canvas_lines, proj_min, 0, proj_width, height)
    ctx.restore()
    //Save into data and apply to the background image of the div
    data_image = canvas.node().toDataURL()
    lines_div.style.backgroundImage = `url(${data_image})`

    ///////////// Initiate the hover movement effect /////////////
    rectangularMoveEffect(map_id) 

    ///////////// Set the culture div click event /////////////
    if(map_id === "constellations") {
        // canvas.style("color", cultures[chosen_culture].color)

        d3.selectAll(".culture-info-wrapper")
            .on("click touchstart", function() {
                let el = d3.select(this).select(".culture-info")
                //Get the new chosen culture
                chosen_culture = el.attr("id").replace("culture-","")

                //Update the title
                d3.selectAll(".chosen-culture-title")
                    .style("color", cultures[chosen_culture].color)
                    .html(toTitleCase(chosen_culture.replace(/_/g, ' ')))

                //Create a new layer with only the lines from that culture and apply that to the background image
                ctx.clearRect(0, 0, width, height)
                ctx.save()
                ctx.translate(-proj_min, 0)
                let canvas_lines = drawConstellationsSimple(opts_general, opts_lines, chosen_culture)
                ctx.drawImage(canvas_lines, proj_min, 0, proj_width, height)
                ctx.restore()
                data_image = canvas.node().toDataURL()
                lines_div.style.backgroundImage = `url(${data_image})`

                //Change the color of the top and bottom border through currentColor
                d3.select("#constellations-border-div").style("color", cultures[chosen_culture].color)

                //Set the colors of the culture info div
                setCultureDivColors(chosen_culture)
            })//on
    }//if

}//createStraightSkyMapLayout

//////////////////////// Colors if the culture div elements ////////////////////////
function setCultureDivColors(chosen_culture) {
    d3.selectAll(".culture-info")
        .each(function () {
            let el = d3.select(this)
            let culture = el.attr("id").replace("culture-", "")
            let color = cultures[culture].color

            //Reset colors
            el.style("color", color) //So I can use CSS currentcolor
            el.transition("color").duration(0).style("background", null)
            el.selectAll(".culture-name, .culture-number, .culture-text")
                .classed("active", false)

            //Transition to the colors of the chosen culture
            if(culture === chosen_culture) {
                //Change the look of the chosen culture's block
                el.transition("color").duration(700)
                    .styleTween("background", () => {
                        let interpolate = d3.interpolateLab("#f7f7f7", color)
                        return function(t) {
                            return `-webkit-linear-gradient(left, ${color} -250%, ${interpolate(t)} 20%`
                        }//return
                    })
                el.selectAll(".culture-name, .culture-number, .culture-text")
                    .classed("active", true)
            }//if
        })//each
}//function setCultureDivColors

//////////////////////// Hover effect ////////////////////////
function rectangularMoveEffect(map_id) {
    let mouse_enter
    let mouse_pos = 0
    d3.select(`#section-${map_id}`).on("mouseover touchstart", function() {
        //Subtract the current value of the CSS variable from the mouse location, so eventually this will balance out in .withLatestFrom 
        mouse_enter = d3.mouse(this)[0] - mouse_pos
        // console.log(d3.mouse(this)[0], mouse_pos, mouse_enter)
    })
        
    //https://codepen.io/flibbon/pen/zojKQB
    //https://codepen.io/davidkpiano/pen/YNOoEK
    //https://css-tricks.com/animated-intro-rxjs/
    const section = document.getElementById(`section-${map_id}`)
    const mouse_move$ = Rx.Observable
        .fromEvent(section, "mousemove")
        .map(e => ({ x: e.clientX }) )
        // .map(e => { console.log(e.clientX); return { x: e.clientX } })
    const touch_move$ = Rx.Observable
        .fromEvent(section, 'touchmove')
        .map(e => ({ x: e.touches[0].clientX }))
    const move$ = Rx.Observable.merge(mouse_move$, touch_move$)

    const smooth_mouse$ = Rx.Observable
        .interval(0, Rx.Scheduler.animationFrame)
        // .withLatestFrom(mouse_move$, (tick, mouse) => mouse)
        // .withLatestFrom(mouse_move$, (tick, mouse) => ({ x : mouse.x - mouse_enter }) )
        .withLatestFrom(move$, (tick, mouse) => { 
            // console.log(mouse_enter) 
            return { x : _.round(mouse.x - mouse_enter,1)}  
        })
        .scan(lerp, {x: 0})

    function lerp(start, end) {
        // console.log(start, end)
        //Update position by 20% of the distance between position & target
        const rate = 0.02
        const dx = end.x - start.x
        return { x: _.round(start.x + dx * rate,1) }
    }//function lerp

    smooth_mouse$.subscribe(pos => {
        mouse_pos = pos.x
        document.documentElement.style.setProperty(`--mouse-${map_id}-x`, _.round(pos.x, 1));
    })
    // RxCSS({ mouse: smooth_mouse$ })
}//function rectangularMoveEffect