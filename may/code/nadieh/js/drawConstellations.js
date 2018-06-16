///////////////////////////////////////////////////////////////////////////
///////////////////////// Draw constellations lines ///////////////////////
///////////////////////////////////////////////////////////////////////////

function drawConstellations(opts_general, opts) {
    
    let projection = opts_general.projection
    let star_by_id = opts.star_by_id
    let chosen_star = star_by_id[opts_general.focus.hip]
    let type = opts_general.type

    let total_width = opts_general.width + opts_general.margin.left + opts_general.margin.right
    let total_height = opts_general.height + opts_general.margin.top + opts_general.margin.bottom

    ///////////// Create canvas /////////////

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 1)

    //Set to the clipped circle
    clipToCircle(ctx, opts_general.width, opts_general.height, opts_general.margin, opts_general.clip_radius)

    ///////////// Set stylings /////////////

    // ctx.globalCompositeOperation = "multiply"

    // //Base color scale of X colors mapped to [0,1]
    // // const colors = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"]
    // const colors = ["#EFB605", "#FE7E2D","#E01A25","#C20049","#991C71","#66489F","#10A4C0","#10A66E","#7EB852"]
    // const color_scale_base = d3.scaleLinear()
    //     .domain(d3.range(colors.length).map(d => d / (colors.length - 1) ))
    //     .range(colors)

    ///////////// Get unique constellations /////////////

    //Get all the lines that are in these constellations
    let chosen_lines = opts.const_links.filter(d => opts.constellations.indexOf(d.const_id) > -1)

    ///////////// Draw lines /////////////

    // let line = d3.line()
    //     .curve(d3.curveNatural)
    //     .context(ctx)

    //Create a unique id per line-star pairing
    //Make sure it doesn't matter if the same combination of stars switches in s-t or t-s setting
    chosen_lines.forEach(d => { d.line_id = d.source < d.target ? d.source + "_" + d.target :  d.target + "_" + d.source })
    //Nest per line id
    let nested_lines = d3.nest()
        .key(d => d.line_id)
        .entries(chosen_lines)
    
    ctx.globalCompositeOperation = "screen"
    ctx.lineWidth = type === "small" ? 3 : 2
    ctx.lineWidth = ctx.lineWidth * (opts.constellations.length > 1 ? 2 : 1)
    ctx.globalAlpha = 0.7
    let offset = 0.95 * ctx.lineWidth

    //Draw the constellation lines
    nested_lines.forEach((d,j) => {
        //Skip constellations that are only 1 star
        if(d.values[0].source === d.values[0].target) return

        let num = d.values.length
        let s = star_by_id[d.values[0].source]
        let pos_s = pixelPos(s.ra, s.dec, projection)
        let t = star_by_id[d.values[0].target]
        let pos_t = pixelPos(t.ra, t.dec, projection)

        //Get the normal line
        //https://stackoverflow.com/questions/16417891
        //https://stackoverflow.com/questions/7469959
        //https://stackoverflow.com/questions/36667930
        let nx = -1 * (pos_t[1] - pos_s[1])
        let ny = pos_t[0] - pos_s[0]
        //Normalize the normal line
        let nl = Math.sqrt(nx*nx + ny*ny)
        nx = nx/nl
        ny = ny/nl

        //Draw each line
        d.values.forEach((l,i) => {
            //Calculate the actual dx & dy offset from the actual source & target star
            let increase
            if(num%2 === 1) increase = Math.ceil(i/2) * (i%2 === 0 ? 1 : -1)
            else increase = (Math.ceil((i+1)/2) - 0.5) * (i%2 === 0 ? -1 : 1)
            let dx = offset * nx * increase
            let dy = offset * ny * increase
            
            ctx.beginPath()
            // if(num > 11) {
            //     let data = [pos_s, [(pos_s[0] + dx + pos_t[0] + dx)/2, (pos_s[1] + dy + pos_t[1] + dy)/2], pos_t]
            //     line(data)
            // } else {
                ctx.moveTo(pos_s[0] + dx, pos_s[1] + dy)
                ctx.lineTo(pos_t[0] + dx, pos_t[1] + dy)
            // }//else
            ctx.strokeStyle = cultures[constellationCulture(l.const_id)].color 
            // color_scale_base(opts.color_scale_const(l.const_id))
            ctx.stroke()
            ctx.closePath()
        })//forEach lines
    })//forEach nested_lines

    // //Draw the constellation lines
    // ctx.beginPath()
    // chosen_lines.forEach(d => {
    //     //if(const_ids.indexOf(d.const_id) > -1) { //} && d.const_id === "romanian-Cma") {
    //         let s = star_by_id[d.source]
    //         let pos_s = pixelPos(s.ra, s.dec, projection)
    //         let t = star_by_id[d.target]
    //         let pos_t = pixelPos(t.ra, t.dec, projection)
    //         ctx.moveTo(pos_s[0], pos_s[1])
    //         ctx.lineTo(pos_t[0], pos_t[1])
    //     //}//if
    // })
    // ctx.stroke()
    // ctx.closePath()

    ///////////// Clip away the constellation lines in a circle around each star /////////////

    ctx.globalAlpha = 1

    let arc = d3.arc().context(ctx)
    let pie = d3.pie().value(1).sort(null)

    //Get all the unique stars in the lines
    let chosen_stars = _.uniq([...chosen_lines.map(d => d.source), ...chosen_lines.map(d => d.target)])

    ctx.globalCompositeOperation = "destination-out"

    chosen_stars.forEach(d => {
        //Get the star's info and location
        let star = star_by_id[d]
        let pos = pixelPos(star.ra, star.dec, projection)

        //Donut size settings
        // let inner = innerRad(star.mag)
        let outer = outerRad(star.mag)

        //Move the canvas to center on the star
        ctx.save()
        ctx.translate(...pos)

        //Take out the lines underneath the star
        ctx.beginPath()
        ctx.arc(0, 0, outer-1, 0, pi2)
        ctx.fill()
        ctx.closePath()

        //Restore canvas to original position
        ctx.restore()
    })//forEach chosen_stars

    ///////////// Draw donuts around stars /////////////

    // ctx.globalCompositeOperation = "multiply"

    ctx.globalCompositeOperation = "source-over"

    if(type !== "small") {
        ctx.shadowBlur = 5
        ctx.shadowColor = "#001540"
    }

    //Loop over all the stars and draw a small donut chart around it to show how many constellations use that star
    chosen_stars.forEach(d => {
        //Get the star's info and location
        let star = star_by_id[d]
        let pos = pixelPos(star.ra, star.dec, projection)
        //What cultures is this star connected to
        let s_star = chosen_lines.filter(s => s.source === d)
        let t_star = chosen_lines.filter(s => s.target === d)
        //Get the unique id's of these constellations
        let const_ids = _.uniq([...s_star, ...t_star].map(d => d.const_id)).sort()

        //Donut size settings
        let inner = innerRad(star.mag)
        let outer = outerRad(star.mag)
        let corner = (outer - inner) * 0.5
        let pad = const_ids.length > 10 ? 0.07 : 3 / Math.sqrt(inner*inner + outer*outer)

        //Create the data for the donut chart
        let arcs = pie(const_ids)

        //Move the canvas to center on the star
        ctx.save()
        ctx.translate(...pos)

        //Draw the donut chart around the star
        arcs.forEach(a => {
            ctx.fillStyle = cultures[constellationCulture(a.data)].color
            //color_scale_base(opts.color_scale_const(a.data))
            ctx.beginPath()
            arc
                //Make sure the padding is the same distance, no matter how large the circle
                .padAngle(pad) 
                .innerRadius(inner)
                .outerRadius(outer)
                .cornerRadius(corner)
                (a)
            ctx.closePath()
            ctx.fill()
        })//forEach

        //Restore canvas to original position
        ctx.restore()
    })//forEach chosen_stars

    ///////////// Draw ring around chosen star /////////////

    ctx.globalCompositeOperation = "source-over"
    ctx.shadowBlur = 0
    ctx.strokeStyle = type === "small" ? "black" : "#fff"
    ctx.lineWidth = type === "small" ? 9 : 3
    ctx.beginPath()
    ctx.arc(...pixelPos(chosen_star.ra, chosen_star.dec, projection), opts.radius_scale(chosen_star.mag) + (type === "small" ? 20 : 12), 0, pi2)
    ctx.closePath()
    ctx.stroke()

    ///////////// Draw circle around it all for small versions /////////////

    // if(type === "small") {
    //     //Don't hold to the clipped circle anymore
    //     ctx.restore()

    //     //Draw the colored circle
    //     ctx.strokeStyle = color_scale_base(opts.color_scale_const(opts.constellations))
    //     ctx.lineWidth = 13
    //     ctx.beginPath()
    //     ctx.arc(total_width/2, total_height/2, 400, 0, pi2)
    //     ctx.closePath()
    //     ctx.stroke()
    // }//if

    ///////////// Helper function /////////////
    function innerRad(mag) { return opts.radius_scale(mag) + 5 }
    function outerRad(mag) { return opts.radius_scale(mag) + (type === "small" ? 10 : 8) }

    return canvas
}//function drawConstellations