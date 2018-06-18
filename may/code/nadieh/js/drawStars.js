///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Draw stars ///////////////////////////////
///////////////////////////////////////////////////////////////////////////
function drawStars(opts_general, opts) {
    
    let total_width = opts_general.width + opts_general.margin.left + opts_general.margin.right
    let total_height = opts_general.height + opts_general.margin.top + opts_general.margin.bottom

    ///////////// Create canvas /////////////

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 1)

    //Set to the clipped circle
    clipToCircle(ctx, opts_general.width, opts_general.height, opts_general.margin, opts_general.clip_radius)

    ///////////// Create scales /////////////

    //Colors of the stars based on their effective temperature
    //https://gka.github.io/chroma.js/
    const star_colors = ["#9db4ff","#aabfff","#cad8ff","#fbf8ff","#fff4e8","#ffddb4","#ffbd6f","#f84235","#AC3D5A","#5A4D6E"]
    const star_temperatures = [30000,20000,8500,6800,5600,4500,3000,2000,1000,500]
    const color_scale = chroma
        .scale(star_colors)
        .domain(star_temperatures)
        // .mode("hsl")

    ///////////// Draw stars /////////////

    // ctx.font = "12px " + font_family
    // ctx.textBaseline = "bottom"
    // ctx.textAlign = "center"

    ctx.globalAlpha = 1
    ctx.shadowBlur = 25

    //Draw the stars
    opts.stars.forEach(d => {
        //Get pixel coordinates on the screen
        let pos = pixelPos(d.ra, d.dec, opts_general.projection)

        //If this star falls outside of the map, don't plot
        if(pos[0] < 0 || pos[0] > total_width || pos[1] < 0 || pos[1] > total_height) return

        //Star dependant settings
        let r = opts.radius_scale(d.mag) //Math.pow(1.2, 5 - d.mag)
        let col = d.t_eff ? color_scale(d.t_eff) : "white"

        //Create a gradient to fill each star with: lighter in center and darker around edges
        let grd = ctx.createRadialGradient(pos[0],pos[1],1,pos[0],pos[1],r*1.1)
        let col_bright = chroma(col).brighten(1)
        let col_dark = chroma(col).saturate(3).darken(1)
        grd.addColorStop(0,col_bright)
        grd.addColorStop(0.6,col)
        grd.addColorStop(1,col_dark)
        ctx.fillStyle = grd
        
        //Create a glow around each star
        // ctx.globalAlpha = 1
        // ctx.shadowBlur = 25 //r * 2.5
        ctx.shadowColor = col

        //Draw the star
        // ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(pos[0], pos[1], r, 0, pi2)
        ctx.fill()
        ctx.closePath()

        // //If there is a star name, add it
        // if(d.proper !== "") {
        //     ctx.fillStyle = "white"
        //     ctx.globalAlpha = 0.5
        //     ctx.shadowBlur = 0
        //     ctx.fillText(d.proper, pos[0], pos[1] - 2 - r)
        // }//if
    })

    return canvas

}//function drawStars