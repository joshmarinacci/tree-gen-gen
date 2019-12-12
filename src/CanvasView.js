import React, {Component} from 'react'
import {hsvToCanvas, randRange, randSpread, sfc32, toRad, xmur3} from './utils.js'
import {PHASES} from './common.js'

//converts h,s,l in the range 0-1 into proper css format
function hsl(hue, s, l) {
    return `hsl(${hue*360}deg,${s*100}%,${l*100}%)`
}

export class CanvasView extends Component {
    componentDidMount() {
        this.redraw()
        this.props.saveTrigger.on("save",()=>{
            this.props.gallery.add(this.canvas)
            this.props.update()
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.redraw()
    }

    render() {
        return <canvas ref={(canvas) => this.canvas = canvas}
                       width={400} height={400}/>
    }

    redraw() {
        const ctx = this.canvas.getContext('2d')
        this.ctx = ctx
        const w = this.canvas.width
        const h = this.canvas.height
        //background
        ctx.fillStyle = '#cccccc'
        ctx.fillRect(0, 0, w, h)

        //floor
        ctx.fillStyle = '#d0d0d0'
        ctx.fillRect(0, h - 10, w, 10)


        if(this.props.doc.algorithm === 'tree') {
            // draw the two phases
            this.firstTrunk(PHASES.TRUNK, this.props.doc)
            this.firstTrunk(PHASES.LEAF, this.props.doc)
        }
        if(this.props.doc.algorithm === 'mountain') {
            console.log("doing the mountain")
            this.drawMountain(this.props.doc)
        }
    }

    firstTrunk(phase, opts) {
        const w = this.canvas.width
        const h = this.canvas.height
        this.phase = phase
        this.ctx.save()
        this.ctx.translate(w / 2, h - 10)
        this.ctx.scale(1, -1)
        const seed = xmur3(opts.seed)
        opts.random = sfc32(seed(), seed(), seed(), seed())
        let width = opts.trunk.width.gen.generate(opts.random)
        let height = opts.trunk.height.gen.generate(opts.random)

        const o2 = {
            trunkColor: randRange(opts.random, 0, 1)
        }
        o2.leafColor = 1.0 - o2.trunkColor
        if (o2.leafColor < 0) o2.leafColor = o2.leafColor + 1.0
        this.trunk(this.ctx, width, height, opts.maxDepth.gen.generate(opts.random), opts, o2)
        this.ctx.restore()

    }

    branch(ctx, w, h, depth, opts, o2) {
        ctx.save()
        ctx.rotate(toRad(opts.branch.angle.gen.generate(opts.random)))
        this.trunk(ctx, w, h, depth - 1, opts, o2)
        ctx.restore()
        ctx.save()
        ctx.rotate(-toRad(opts.branch.angle.gen.generate(opts.random)))
        this.trunk(ctx, w, h, depth - 1, opts, o2)
        ctx.restore()
    }

    trunk(ctx, w, h, depth, opts, o2) {
        const nw = w * opts.trunk.attenuation.defaultValue
        const nh = h * opts.trunk.attenuation.gen.generate(opts.random)

        if (this.phase === PHASES.TRUNK) {
            const step = 0.5 / opts.maxDepth.gen.generate(opts.random)
            ctx.fillStyle = hsvToCanvas(o2.trunkColor, 0.8, 1.0 - depth * step)
            const type = opts.trunk.type.gen.generate(opts.random)
            if (type === 'rectangle') {
                ctx.fillRect(-w / 2, 0, w, nh)
            }
            if (type === 'trapezoid') {
                ctx.beginPath()
                ctx.moveTo(-w / 2, 0)
                ctx.lineTo(-nw / 2, nh)
                ctx.lineTo(nw / 2, nh)
                ctx.lineTo(w / 2, 0)
                ctx.fill()
            }
        }
        ctx.save()
        ctx.translate(0, nh)
        if (depth === 0) this.leaf(ctx, nw, nh, opts, o2)
        if (depth > 0) this.branch(ctx, nw, nh, depth, opts, o2)
        ctx.restore()
    }

    leaf(ctx, w, h, opts, o2) {
        ctx.save()
        ctx.rotate(toRad(opts.leaf.angle.gen.generate(opts.random)))
        const sat = randSpread(opts.random, 0.5, 0.2)
        ctx.fillStyle = hsvToCanvas(o2.leafColor, sat, 1.0)
        let s = opts.leaf.size.gen.generate(opts.random)
        if (s < 0) s = 0

        if (this.phase !== PHASES.LEAF) {
            return ctx.restore()
        }
        const type = opts.leaf.type.gen.generate(opts.random)
        if (type === 'square') {
            ctx.fillRect(-s, -s, s * 2, s * 2)
        }
        if (type === 'circle') {
            ctx.beginPath()
            ctx.arc(0, 0, s, 0, toRad(360))
            ctx.fill()
        }
        if (type === 'triangle') {
            ctx.beginPath()
            for (let i = 0; i <= 3; i++) {
                let theta = toRad(360 / 3 * i)
                let x = s * Math.sin(theta)
                let y = s * Math.cos(theta)
                if (i === 0) ctx.moveTo(x, y)
                ctx.lineTo(x, y)
            }
            ctx.fill()
        }
        if (type === 'ellipse') {
            ctx.beginPath()
            ctx.ellipse(0, 0, s, s / 2, 0, 0, toRad(360))
            ctx.fill()
        }
        ctx.restore()
    }

    drawMountain(opts) {
        const seed = xmur3(opts.seed)
        opts.random = sfc32(seed(), seed(), seed(), seed())
        const w = this.canvas.width
        const h = this.canvas.height
        this.ctx.save()
        this.ctx.translate(w / 2, h - 10)
        this.ctx.scale(1, -1)
        const rows = opts.main.rows.gen.generate(opts.random)
        let hue = opts.main.hue.gen.generate(opts.random)
        const ctx = this.ctx
        let rowsize = h/rows
        for(let i=0; i< rows; i++) {
            const length = opts.main.length.gen.generate(opts.random)
            let step = w/length
            let rowStep = 1.0/rows*i
            ctx.fillStyle = hsl(hue,rowStep,rowStep)
            ctx.beginPath()
            const y = h-(i+1)*rowsize
            ctx.moveTo(-w/2,y)
            for(let j=0; j<length; j++) {
                let peakHeight = opts.main.peakHeight.gen.generate(opts.random)
                ctx.lineTo(j*step-w/2,y+peakHeight)
            }
            ctx.lineTo(w/2,y+rowsize)
            ctx.lineTo(w/2,y)
            ctx.fill()
        }
        this.ctx.restore()
    }
}
