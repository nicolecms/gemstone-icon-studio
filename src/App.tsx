import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  assetManifest,
  defaultSelections,
  layerOrderBottomToTop,
  type AssetVariant,
} from './data/assetManifest'
import { renderIcon, type RenderConfig } from './engine/renderIcon'
import './App.css'

type SelectableLayer = 'jewel' | 'ribbon' | 'character' | 'metal' | 'secondary' | 'primary' | 'pattern'
type SelectionState = {
  jewel: AssetVariant
  ribbon: AssetVariant
  character: AssetVariant
  metal: AssetVariant
  secondary: AssetVariant
  primary: AssetVariant
  pattern: AssetVariant
  colour: (typeof assetManifest.colours)[number]
}
type VisibilityState = Record<SelectableLayer, boolean>

const layerLabels: Record<(typeof layerOrderBottomToTop)[number], string> = {
  colour: '純色背景',
  pattern: '背景圖案',
  photo: '使用者照片（圓形裁切）',
  metal: '金屬框',
  secondary: '次要框',
  primary: '主要框',
  character: '角色',
  ribbon: '絲帶',
  jewel: '寶石',
}

const pickerSections: { key: SelectableLayer; title: string; hint: string }[] = [
  { key: 'jewel', title: '寶石', hint: '選擇你的生日寶石' },
  { key: 'ribbon', title: '絲帶', hint: '配搭同款寶石色系' },
  { key: 'character', title: '角色', hint: '選擇喜歡的角色' },
  { key: 'metal', title: '金屬框', hint: '金、銀或銅' },
  { key: 'secondary', title: '次要框', hint: '白色或黑色' },
  { key: 'primary', title: '主要框', hint: '選擇主要框的寶石款式' },
  { key: 'pattern', title: '背景圖案', hint: '可關閉圖案，只保留純色' },
]

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selections, setSelections] = useState<SelectionState>(defaultSelections)
  const [visible, setVisible] = useState<VisibilityState>({
    jewel: true,
    ribbon: true,
    character: true,
    metal: true,
    secondary: true,
    primary: true,
    pattern: true,
  })
  const [photo, setPhoto] = useState<RenderConfig['photo']>({ image: null, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 })
  const [photoError, setPhotoError] = useState('')
  const [exportError, setExportError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const [assetErrors, setAssetErrors] = useState<string[]>([])
  const [renderError, setRenderError] = useState('')
  const [isRendering, setIsRendering] = useState(true)

  const config = useMemo<RenderConfig>(() => ({
    colour: selections.colour,
    pattern: visible.pattern ? selections.pattern : null,
    photo,
    metal: visible.metal ? selections.metal : null,
    secondary: visible.secondary ? selections.secondary : null,
    primary: visible.primary ? selections.primary : null,
    character: visible.character ? selections.character : null,
    ribbon: visible.ribbon ? selections.ribbon : null,
    jewel: visible.jewel ? selections.jewel : null,
  }), [selections, visible, photo])

  const handleAssetError = useCallback((src: string) => {
    setAssetErrors((current) => current.includes(src) ? current : [...current, src])
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    setIsRendering(true)
    setRenderError('')
    setAssetErrors([])

    renderIcon(canvas, config, {
      size: 1024,
      includeBackground: true,
      onAssetError: handleAssetError,
      shouldCancel: () => cancelled,
    })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRenderError(error instanceof Error ? error.message : '繪製圖示時發生未知錯誤。')
        }
      })
      .finally(() => {
        if (!cancelled) setIsRendering(false)
      })

    return () => { cancelled = true }
  }, [config, handleAssetError])


  const uploadPhoto = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setPhotoError('請選擇有效的圖片檔案。'); return }
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setPhoto({ image, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 })
      setPhotoError('')
      setExportError('')
    }
    image.onerror = () => { URL.revokeObjectURL(url); setPhotoError('無法讀取這張圖片，請嘗試另一個檔案。') }
    image.src = url
  }

  const resetPhoto = () => setPhoto((current) => ({ ...current, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 }))
  const fitPhoto = () => setPhoto((current) => ({ ...current, zoom: 1, offsetX: 0, offsetY: 0 }))
  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photo.image) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX: photo.offsetX, offsetY: photo.offsetY }
  }
  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = 1024 / rect.width
    setPhoto((current) => ({ ...current, offsetX: dragRef.current!.offsetX + (event.clientX - dragRef.current!.x) * scale, offsetY: dragRef.current!.offsetY + (event.clientY - dragRef.current!.y) * scale }))
  }
  const stopCanvasDrag = () => { dragRef.current = null }

  const exportPng = async (mode: 'transparent' | 'background') => {
    setIsExporting(true)
    setExportError('')
    try {
      const exportCanvas = document.createElement('canvas')
      const exportErrors: string[] = []
      await renderIcon(exportCanvas, config, {
        size: 1024,
        includeBackground: mode === 'background',
        onAssetError: (src) => exportErrors.push(src),
      })
      if (exportErrors.length) throw new Error(`有素材載入失敗：${exportErrors.slice(0, 3).join('、')}`)
      const blob = await new Promise<Blob>((resolve, reject) => {
        exportCanvas.toBlob((result) => result ? resolve(result) : reject(new Error('瀏覽器無法建立 PNG 檔案。')), 'image/png')
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = mode === 'transparent' ? 'gemstone-icon-transparent.png' : 'gemstone-icon-background.png'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : '匯出失敗，請再試一次。')
    } finally {
      setIsExporting(false)
    }
  }

  const chooseAsset = (layer: SelectableLayer, asset: AssetVariant) => {
    setSelections((current) => ({ ...current, [layer]: asset }))
  }

  const toggleLayer = (layer: SelectableLayer) => {
    setVisible((current) => ({ ...current, [layer]: !current[layer] }))
  }

  const selectedAsset = (layer: SelectableLayer) => selections[layer]

  return (
    <main className="studio" lang="zh-Hant">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="小寶石工作室首頁">
          <span className="wordmark-gem" aria-hidden="true">✧</span>
          <span>小寶石 <span className="wordmark-light">工作室</span></span>
        </a>
        <span className="topbar-note">打造專屬於你的生日寶石圖示</span>
        <span className="language-pill">繁體中文</span>
      </header>

      <section className="intro">
        <p className="eyebrow">你的圖示，由你創作</p>
        <h1>為日常添一點<span>寶石魔法。</span></h1>
        <p className="intro-copy">選擇喜歡的寶石、角色與配色，即時預覽你的專屬圖示。</p>
      </section>

      <section className="editor" aria-label="圖示自訂工作區">
        <div className="preview-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">即時預覽</p>
              <h2>你的專屬寶石</h2>
            </div>
            <span className="draft-pill"><span />{isRendering ? '更新中' : '即時預覽'}</span>
          </div>

          <div className="preview-stage canvas-stage">
            <div className="preview-halo halo-one" />
            <div className="preview-halo halo-two" />
            <canvas ref={canvasRef} className="icon-canvas" width={1024} height={1024} aria-label="寶石圖示畫布預覽；可拖曳照片調整位置" onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={stopCanvasDrag} onPointerCancel={stopCanvasDrag} />
          </div>

          <div className="preview-footer">
            <span><span className="status-dot" />{isRendering ? '正在更新圖層…' : '所有選擇已反映於預覽'}</span>
            <span>畫布尺寸：1024 × 1024 px</span>
          </div>


          <section className="photo-tools" aria-label="照片編輯">
            <h3>上載及編輯照片</h3>
            <label className="upload-button">選擇圖片
              <input type="file" accept="image/*" onChange={(event) => uploadPhoto(event.currentTarget.files?.[0])} />
            </label>
            <p className="photo-help">在預覽上拖曳照片以移動位置。照片會裁切於固定圓形範圍內。</p>
            <label className="photo-control">縮放 <input type="range" min="1" max="4" step="0.05" value={photo.zoom} onChange={(event) => setPhoto((current) => ({ ...current, zoom: Number(event.target.value) }))} /><span>{photo.zoom.toFixed(2)}×</span></label>
            <label className="photo-control">旋轉 <input type="range" min="-180" max="180" step="1" value={photo.rotation} onChange={(event) => setPhoto((current) => ({ ...current, rotation: Number(event.target.value) }))} /><span>{photo.rotation}°</span></label>
            <div className="photo-actions"><button type="button" onClick={fitPhoto}>適合圓形</button><button type="button" onClick={resetPhoto}>重設照片</button></div>
            {photoError && <p className="inline-error" role="alert">{photoError}</p>}
          </section>
          <section className="export-panel" aria-label="匯出 PNG">
            <h3>匯出 PNG</h3>
            <p>兩種格式均保留照片及所有裝飾圖層。</p>
            <div className="export-actions">
              <button type="button" disabled={isExporting} onClick={() => void exportPng('transparent')}>透明背景 PNG</button>
              <button type="button" disabled={isExporting} onClick={() => void exportPng('background')}>含背景 PNG</button>
            </div>
            <small>輸出尺寸：1024 × 1024 px{isExporting ? ' · 正在匯出…' : ''}</small>
            {exportError && <p className="inline-error" role="alert">{exportError}</p>}
          </section>

          {renderError && <div className="error-panel" role="alert"><strong>無法繪製畫布</strong><p>{renderError}</p></div>}
          {assetErrors.length > 0 && (
            <div className="warning-panel" role="status">
              <strong>有 {assetErrors.length} 個素材無法載入</strong>
              <p>請確認檔案存在於下列路徑，並且檔名大小寫一致。其餘圖層仍會繼續繪製。</p>
              <ul>{assetErrors.slice(0, 6).map((src) => <li key={src}><code>{src}</code></li>)}</ul>
              {assetErrors.length > 6 && <p>另有 {assetErrors.length - 6} 個素材未能載入。</p>}
            </div>
          )}

          <section className="manifest-panel visibility-panel">
            <div className="section-heading">
              <div><h3>裝飾圖層</h3><p>關閉不需要的元素，預覽會即時更新。</p></div>
            </div>
            <div className="visibility-grid">
              {pickerSections.map(({ key, title }) => (
                <label className="visibility-toggle" key={key}>
                  <input type="checkbox" checked={visible[key]} onChange={() => toggleLayer(key)} />
                  <span className="toggle-track" aria-hidden="true"><span /></span>
                  <span>{title}</span>
                </label>
              ))}
            </div>
            <p className="visibility-note">照片與純色背景固定顯示；背景圖案及其他裝飾可獨立開關。</p>
          </section>
        </div>

        <aside className="controls-column">
          <div className="section-heading controls-heading">
            <div><p className="eyebrow">自訂你的圖示</p><h2>選擇素材</h2></div>
            <span className="step-count">8 款設定</span>
          </div>
          <p className="panel-intro">點選縮圖即可更新左側預覽。金屬框、次要框及主要框會按順序疊加顯示。</p>

          <section className="picker-section">
            <div className="picker-title-row"><h3>純色背景</h3><span>{selections.colour.value.toUpperCase()}</span></div>
            <div className="colour-grid" role="group" aria-label="選擇純色背景">
              {assetManifest.colours.map((colour) => (
                <button
                  type="button"
                  key={colour.id}
                  className={`colour-swatch ${selections.colour.id === colour.id ? 'is-selected' : ''}`}
                  style={{ '--swatch': colour.value } as CSSProperties}
                  onClick={() => setSelections((current) => ({ ...current, colour }))}
                  aria-label={`${colour.label} ${colour.value}`}
                  aria-pressed={selections.colour.id === colour.id}
                  title={`${colour.label} · ${colour.value}`}
                ><span /></button>
              ))}
            </div>
          </section>

          {pickerSections.map(({ key, title, hint }) => {
            const variants = assetManifest[key === 'pattern' ? 'pattern' : key]
            return (
              <section className="picker-section" key={key}>
                <div className="picker-title-row">
                  <div><h3>{title}</h3><p>{hint}</p></div>
                  <label className="mini-toggle" title={visible[key] ? `隱藏${title}` : `顯示${title}`}>
                    <input type="checkbox" checked={visible[key]} onChange={() => toggleLayer(key)} />
                    <span>{visible[key] ? '顯示' : '隱藏'}</span>
                  </label>
                </div>
                {key === 'secondary' ? (
                  <div className="secondary-options" role="group" aria-label="選擇次要框顏色">
                    {assetManifest.secondary.map((asset, index) => (
                      <button
                        type="button"
                        key={asset.id}
                        className={`secondary-option ${selections.secondary.id === asset.id ? 'is-selected' : ''}`}
                        onClick={() => chooseAsset('secondary', asset)}
                        aria-pressed={selections.secondary.id === asset.id}
                      >
                        <span className={`secondary-swatch ${index === 0 ? 'swatch-white' : 'swatch-black'}`} />
                        <span>{asset.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="asset-grid" role="group" aria-label={`選擇${title}`}>
                    {variants.map((asset) => (
                      <button
                        type="button"
                        key={asset.id}
                        className={`asset-option ${selectedAsset(key).id === asset.id ? 'is-selected' : ''}`}
                        onClick={() => chooseAsset(key, asset)}
                        aria-pressed={selectedAsset(key).id === asset.id}
                        title={asset.label}
                      >
                        <span className="asset-thumb">
                          <img src={asset.optionSrc} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.opacity = '0' }} />
                          <span className="asset-thumb-fallback" aria-hidden="true">✧</span>
                        </span>
                        <span className="asset-option-label">{asset.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </aside>
      </section>

      <footer className="page-footer">
        <span>用一點閃耀，創作屬於你的故事 ✧</span>
        <span>小寶石工作室 · 開發預覽版</span>
      </footer>
    </main>
  )
}

export default App          {renderError && <div className="error-panel" role="alert"><strong>無法繪製畫布</strong><p>{renderError}</p></div>}
          {assetErrors.length > 0 && (
            <div className="warning-panel" role="status">
              <strong>有 {assetErrors.length} 個素材無法載入</strong>
              <p>請確認檔案存在於下列路徑，並且檔名大小寫一致。其餘圖層仍會繼續繪製。</p>
              <ul>{assetErrors.slice(0, 6).map((src) => <li key={src}><code>{src}</code></li>)}</ul>
              {assetErrors.length > 6 && <p>另有 {assetErrors.length - 6} 個素材未能載入。</p>}
            </div>
          )}

          <section className="manifest-panel visibility-panel">
            <div className="section-heading">
              <div><h3>裝飾圖層</h3><p>關閉不需要的元素，預覽會即時更新。</p></div>
            </div>
            <div className="visibility-grid">
              {pickerSections.map(({ key, title }) => (
                <label className="visibility-toggle" key={key}>
                  <input type="checkbox" checked={visible[key]} onChange={() => toggleLayer(key)} />
                  <span className="toggle-track" aria-hidden="true"><span /></span>
                  <span>{title}</span>
                </label>
              ))}
            </div>
            <p className="visibility-note">照片與純色背景固定顯示；背景圖案及其他裝飾可獨立開關。</p>
          </section>
        </div>

        <aside className="controls-column">
          <div className="section-heading controls-heading">
            <div><p className="eyebrow">自訂你的圖示</p><h2>選擇素材</h2></div>
            <span className="step-count">8 款設定</span>
          </div>
          <p className="panel-intro">點選縮圖即可更新左側預覽。金屬框、次要框及主要框會按順序疊加顯示。</p>

          <section className="picker-section">
            <div className="picker-title-row"><h3>純色背景</h3><span>{selections.colour.value.toUpperCase()}</span></div>
            <div className="colour-grid" role="group" aria-label="選擇純色背景">
              {assetManifest.colours.map((colour) => (
                <button
                  type="button"
                  key={colour.id}
                  className={`colour-swatch ${selections.colour.id === colour.id ? 'is-selected' : ''}`}
                  style={{ '--swatch': colour.value } as CSSProperties}
                  onClick={() => setSelections((current) => ({ ...current, colour }))}
                  aria-label={`${colour.label} ${colour.value}`}
                  aria-pressed={selections.colour.id === colour.id}
                  title={`${colour.label} · ${colour.value}`}
                ><span /></button>
              ))}
            </div>
          </section>

          {pickerSections.map(({ key, title, hint }) => {
            const variants = assetManifest[key === 'pattern' ? 'pattern' : key]
            return (
              <section className="picker-section" key={key}>
                <div className="picker-title-row">
                  <div><h3>{title}</h3><p>{hint}</p></div>
                  <label className="mini-toggle" title={visible[key] ? `隱藏${title}` : `顯示${title}`}>
                    <input type="checkbox" checked={visible[key]} onChange={() => toggleLayer(key)} />
                    <span>{visible[key] ? '顯示' : '隱藏'}</span>
                  </label>
                </div>
                {key === 'secondary' ? (
                  <div className="secondary-options" role="group" aria-label="選擇次要框顏色">
                    {assetManifest.secondary.map((asset, index) => (
                      <button
                        type="button"
                        key={asset.id}
                        className={`secondary-option ${selections.secondary.id === asset.id ? 'is-selected' : ''}`}
                        onClick={() => chooseAsset('secondary', asset)}
                        aria-pressed={selections.secondary.id === asset.id}
                      >
                        <span className={`secondary-swatch ${index === 0 ? 'swatch-white' : 'swatch-black'}`} />
                        <span>{asset.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="asset-grid" role="group" aria-label={`選擇${title}`}>
                    {variants.map((asset) => (
                      <button
                        type="button"
                        key={asset.id}
                        className={`asset-option ${selectedAsset(key).id === asset.id ? 'is-selected' : ''}`}
                        onClick={() => chooseAsset(key, asset)}
                        aria-pressed={selectedAsset(key).id === asset.id}
                        title={asset.label}
                      >
                        <span className="asset-thumb">
                          <img src={asset.optionSrc} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.opacity = '0' }} />
                          <span className="asset-thumb-fallback" aria-hidden="true">✧</span>
                        </span>
                        <span className="asset-option-label">{asset.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </aside>
      </section>

      <footer className="page-footer">
        <span>用一點閃耀，創作屬於你的故事 ✧</span>
        <span>小寶石工作室 · 開發預覽版</span>
      </footer>
    </main>
  )
}

export default App

