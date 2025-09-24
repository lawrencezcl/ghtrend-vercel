import { initWasm, Resvg } from '@resvg/resvg-wasm'

let inited = false

export async function svgToPng(svg: string, width = 1200): Promise<Buffer> {
  if (!inited) {
    await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'))
    inited = true
  }
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: 'rgba(0,0,0,0)' })
  const pngData = r.render().asPng()
  return Buffer.from(pngData)
}
