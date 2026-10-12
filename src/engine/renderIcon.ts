import type { AssetVariant, ColourVariant } from '../data/assetManifest'

export type PhotoTransform = {
  image: HTMLImageElement | null
  zoom: number
  rotation: number
  offsetX: number
  offsetY: number
}

export type RenderConfig = {
  colour: ColourVariant
  pattern: AssetVariant | null
  photo: PhotoTransform
  metal: AssetVariant | null
  secondary: AssetVariant | null
  primary: AssetVariant | null
  character: AssetVariant | null
  ribbon: AssetVariant | null
  jewel: AssetVariant | null
}

export type RenderOptions = {
  size?: number
  includeBackground?: boolean
  onAssetError?: (src: string, error: unknown) => void
  shouldCancel?: () => boolean
}

const imageCache = new Map<string, HTMLImageElement>()
const SIZE = 1024
// Given mask: 856px diameter on a 1080px canvas, with asymmetric padding.
// Scale its centre and radius to the renderer's 1024 × 1024 coordinate space.
const PHOTO_CIRCLE = {
  cx: ((115 + (1080 - 115 - 109) / 2) / 1080) * SIZE,
  cy: ((112 + (1080 - 112 - 102) / 2) / 1080) * SIZE,
  radius: (856 / 2 / 1080) * SIZE,
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached?.complete && cached.naturalWidth > 0) return Promise.resolve(cached)
  if (cached?.complete && cached.naturalWidth === 0) imageCache.delete(src)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        imageCache.set(src, image)
        resolve(image)
      } else {
        imageCache.delete(src)
        reject(new Error(`圖片沒有有效尺寸：${src}`))
      }
    }
    image.onerror = () => {
      imageCache.delete(src)
      reject(new Error(`無法載入素材：${src}`))
    }
    image.decoding = 'async'
    image.src = src
    imageCache.set(src, image)
  })
}

function drawPlaceholderPhoto(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const gradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
  gradient.addColorStop(0, '#F9EAF1')
  gradient.addColorStop(1, '#DCCBEA')
  ctx.fillStyle = gradient
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  ctx.fillStyle = '#B58CA7'
  ctx.beginPath()
  ctx.ellipse(cx, cy - radius * 0.2, radius * 0.28, radius * 0.34, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#8D6D8D'
  ctx.beginPath()
  ctx.ellipse(cx, cy + radius * 0.66, radius * 0.62, radius * 0.52, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFF9FC'
  ctx.font = '500 25px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('上載照片', cx, cy + radius * 0.86)
}

function drawPhoto(ctx: CanvasRenderingContext2D, photo: PhotoTransform) {
  const { cx, cy, radius } = PHOTO_CIRCLE
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.clip()
  if (!photo.image) {
    drawPlaceholderPhoto(ctx, cx, cy, radius)
    ctx.restore()
    return
  }
  const image = photo.image
  const fitScale = Math.max((radius * 2) / image.naturalWidth, (radius * 2) / image.naturalHeight)
  const scale = fitScale * Math.max(0.25, Math.min(photo.zoom, 5))
  ctx.translate(cx + photo.offsetX, cy + photo.offsetY)
  ctx.rotate((photo.rotation * Math.PI) / 180)
  ctx.scale(scale, scale)
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
  ctx.restore()
}

async function drawAsset(ctx: CanvasRenderingContext2D, asset: AssetVariant | null, options: RenderOptions) {
  if (!asset || options.shouldCancel?.()) return
  try {
    const image = await loadImage(asset.previewSrc)
    if (options.shouldCancel?.()) return
    ctx.drawImage(image, 0, 0, SIZE, SIZE)
  } catch (error) {
    options.onAssetError?.(asset.previewSrc, error)
  }
}

export async function renderIcon(
  canvas: HTMLCanvasElement,
  config: RenderConfig,
  options: RenderOptions = {},
): Promise<void> {
  const size = options.size ?? SIZE
  const includeBackground = options.includeBackground ?? true
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('此瀏覽器無法建立 Canvas 2D 繪圖環境。')
  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.scale(size / SIZE, size / SIZE)
  if (options.shouldCancel?.()) { ctx.restore(); return }
  if (includeBackground) {
    ctx.fillStyle = config.colour.value
    ctx.fillRect(0, 0, SIZE, SIZE)
    await drawAsset(ctx, config.pattern, options)
    if (options.shouldCancel?.()) { ctx.restore(); return }
  }
  // Photo is always drawn in both export modes; only the background is optional.
  drawPhoto(ctx, config.photo)
  for (const asset of [config.metal, config.secondary, config.primary, config.character, config.ribbon, config.jewel]) {
    await drawAsset(ctx, asset, options)
    if (options.shouldCancel?.()) { ctx.restore(); return }
  }
  ctx.restore()
}
