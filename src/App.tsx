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
type VisibilityState = Record<SelectableLayer, boolean> & { colour: boolean }

const layerLabels: Record<(typeof layerOrderBottomToTop)[number], string> = {
  colour: '純色背景',
  pattern: '背景圖案',
  photo: '使用者照片（圓形裁切）',
  metal: '金屬配件',
  secondary: '副色',
  primary: '主色',
  character: '角色',
  ribbon: '絲帶',
  jewel: '寶石',
}

const wizardSteps = [
  { title: '上載及編輯照片', description: '加入照片，調整位置與大小' },
  { title: '選擇蝴蝶結', description: '配搭喜歡的寶石與絲帶' },
  { title: '選擇公仔', description: '挑選你喜歡的公仔' },
  { title: '選擇邊框', description: '設定主框、副框及金屬配件' },
  { title: '選擇背景', description: '選擇背景顏色與圖案' },
] as const

const pickerSections: { key: SelectableLayer; title: string; hint: string }[] = [
  { key: 'jewel', title: '寶石', hint: '選擇你的生日寶石' },
  { key: 'ribbon', title: '絲帶', hint: '配搭同款寶石色系' },
  { key: 'character', title: '公仔', hint: '選擇喜歡的公仔' },
  { key: 'metal', title: '金屬配件', hint: '金、銀或銅' },
  { key: 'secondary', title: '副色', hint: '白色或黑色' },
  { key: 'primary', title: '主色', hint: '選擇主要框的寶石款式' },
  { key: 'pattern', title: '背景圖案', hint: '可關閉圖案，只保留純色' },
]

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [categoryTab, setCategoryTab] = useState<Record<number, string>>({ 1: 'jewel', 3: 'primary', 4: 'colour' })
  const [completionMessage, setCompletionMessage] = useState('')
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const [exportPreview, setExportPreview] = useState('')
  const [selections, setSelections] = useState<SelectionState>(defaultSelections)
  const [visible, setVisible] = useState<VisibilityState>({
    jewel: true,
    ribbon: true,
    character: true,
    metal: true,
    secondary: true,
    primary: true,
    pattern: true,
    colour: true,
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
    colour: visible.colour ? selections.colour : null,
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

  const exportPng = async () => {
    setIsExporting(true)
    setExportError('')
    try {
      const exportCanvas = document.createElement('canvas')
      const exportErrors: string[] = []
      await renderIcon(exportCanvas, config, {
        size: 1024,
        includeBackground: true,
        onAssetError: (src) => exportErrors.push(src),
      })
      if (exportErrors.length) throw new Error(`有素材載入失敗：${exportErrors.slice(0, 3).join('、')}`)
      const blob = await new Promise<Blob>((resolve, reject) => {
        exportCanvas.toBlob((result) => result ? resolve(result) : reject(new Error('瀏覽器無法建立 PNG 檔案。')), 'image/png')
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'gemstone-icon.png'
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

  const toggleLayer = (layer: SelectableLayer | 'colour') => {
    setVisible((current) => {
      const nextValue = !current[layer]
      if (layer === 'colour' && !nextValue) {
        setCategoryTab((tabs) => ({ ...tabs, 4: 'colour' }))
        return { ...current, colour: false, pattern: false }
      }
      return { ...current, [layer]: nextValue }
    })
  }

  const selectedAsset = (layer: SelectableLayer) => selections[layer]
  const goToStep = (step: number) => {
    setActiveStep(Math.max(0, Math.min(wizardSteps.length - 1, step)))
    setCompletionMessage('')
  }
  const visiblePickerSections = pickerSections.filter(({ key }) => {
    if (activeStep === 1) return key === categoryTab[1]
    if (activeStep === 2) return key === 'character'
    if (activeStep === 3) return key === categoryTab[3]
    if (activeStep === 4) return key === 'pattern' && categoryTab[4] === 'pattern' && visible.colour
    return false
  })

  const handleDownload = () => {
    setExportError('')
    setExportPreview(canvasRef.current?.toDataURL('image/png') ?? '')
    setIsCompletionModalOpen(true)
    void exportPng()
  }

  return (
    <main className="studio" lang="zh-Hant">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="BB寶石工作坊首頁">
          <span className="wordmark-gem" aria-hidden="true">✧</span>
          <span>BB寶石 <span className="wordmark-light">工作坊</span></span>
        </a>
        <span className="topbar-note">與BB們齊手打造獨一無二的寶石頭像</span>
      </header>

      <a className="back-home-link" href="" onClick={(event) => event.preventDefault()}><span aria-hidden="true">‹</span> 返回主頁</a>
      <section className="editor" aria-label="圖片自訂工作區">
        <div className="preview-column">
          <div className="section-heading preview-heading">
            <div>
              <p className="eyebrow">即時預覽</p>
              <h2>你的寶石頭像</h2>
            </div>
            <div className="preview-header-actions">
              <button type="button" className="preview-utility-button">隨機</button>
              <button type="button" className="preview-utility-button">重設</button>
            </div>
          </div>

          <div className="preview-stage canvas-stage">
            <div className="preview-halo halo-one" />
            <div className="preview-halo halo-two" />
            <canvas ref={canvasRef} className="icon-canvas" width={1024} height={1024} aria-label="寶石圖示畫布預覽；可拖曳照片調整位置" onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={stopCanvasDrag} onPointerCancel={stopCanvasDrag} />
          </div>

          {exportError && <p className="inline-error" role="alert">{exportError}</p>}

          {renderError && <div className="error-panel" role="alert"><strong>無法繪製畫布</strong><p>{renderError}</p></div>}
          {assetErrors.length > 0 && (
            <div className="warning-panel" role="status">
              <strong>有 {assetErrors.length} 個素材無法載入</strong>
              <p>請確認檔案存在於下列路徑，並且檔名大小寫一致。其餘圖層仍會繼續繪製。</p>
              <ul>{assetErrors.slice(0, 6).map((src) => <li key={src}><code>{src}</code></li>)}</ul>
              {assetErrors.length > 6 && <p>另有 {assetErrors.length - 6} 個素材未能載入。</p>}
            </div>
          )}


        </div>

        <aside className="controls-column">
          <div className="sidebar-heading">
            <div><p className="eyebrow">自訂你的頭像</p><h2>{wizardSteps[activeStep].title}</h2>
              {activeStep === 4 && <p className="sidebar-instruction">可關閉此層顯示，以導出透明背景圖片</p>}
            </div>
            <span className="step-count">{activeStep + 1}/{wizardSteps.length}</span>
          </div>
          <nav className="wizard-progress" aria-label="自訂步驟">
            {wizardSteps.map((step, index) => (
              <button
                type="button"
                key={step.title}
                className={`wizard-step ${activeStep === index ? 'is-active' : ''} ${activeStep > index ? 'is-complete' : ''}`}
                aria-current={activeStep === index ? 'step' : undefined}
                onClick={() => goToStep(index)}
              >
                <span className="wizard-step-number">{activeStep > index ? '✓' : index + 1}</span>
                <span className="wizard-step-title">{step.title}</span>
              </button>
            ))}
          </nav>
          <div className="picker-scroll">
          {[1, 3, 4].includes(activeStep) && <div className="category-tabs" role="tablist" aria-label="選擇類別">
            {(activeStep === 1 ? [{ key: 'jewel', label: '寶石' }, { key: 'ribbon', label: '絲帶' }] : activeStep === 3 ? [{ key: 'primary', label: '主色' }, { key: 'secondary', label: '副色' }, { key: 'metal', label: '金屬配件' }] : [{ key: 'colour', label: '顏色' }, { key: 'pattern', label: '圖案' }]).map((tab) => {
              const disabled = activeStep === 4 && tab.key === 'pattern' && !visible.colour
              return <button key={tab.key} type="button" role="tab" aria-selected={categoryTab[activeStep] === tab.key} disabled={disabled} className={`category-tab ${categoryTab[activeStep] === tab.key ? 'is-active' : ''}`} onClick={() => setCategoryTab((current) => ({ ...current, [activeStep]: tab.key }))}>{tab.label}</button>
            })}
          </div>}
          {activeStep === 0 && (
            <section className="photo-tools" aria-label="照片編輯">
              <h3>上載及編輯照片</h3>
              <label className="upload-button">選擇圖片
                <input type="file" accept="image/*" onChange={(event) => uploadPhoto(event.currentTarget.files?.[0])} />
              </label>
              <p className="photo-help">在預覽上拖曳照片以移動位置。照片會裁切於固定圓形範圍內。</p>
              <label className="photo-control">縮放 <input type="range" min="1" max="4" step="0.05" value={photo.zoom} onChange={(event) => setPhoto((current) => ({ ...current, zoom: Number(event.target.value) }))} /><span>{photo.zoom.toFixed(2)}×</span></label>
              <label className="photo-control">旋轉 <input type="range" min="-180" max="180" step="1" value={photo.rotation} onChange={(event) => setPhoto((current) => ({ ...current, rotation: Number(event.target.value) }))} /><span>{photo.rotation}°</span></label>
              <div className="photo-actions"><button type="button" onClick={fitPhoto}>符合遮罩範圍</button><button type="button" onClick={resetPhoto}>重設照片</button></div>
              {photoError && <p className="inline-error" role="alert">{photoError}</p>}
            </section>
          )}

          {activeStep === 4 && categoryTab[4] === 'colour' && <section className="picker-section">
            <div className="picker-title-row">
              <div><h3>顏色</h3></div>
              <label className="mini-toggle" title={visible.colour ? '隱藏純色背景' : '顯示純色背景'}>
                <input type="checkbox" checked={visible.colour} onChange={() => toggleLayer('colour')} />
                <span>{visible.colour ? '顯示' : '隱藏'}</span>
              </label>
            </div>
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
          </section>}

          {visiblePickerSections.map(({ key, title, hint }) => {
            const variants = assetManifest[key === 'pattern' ? 'pattern' : key]
            return (
              <section className="picker-section" key={key}>
                <div className="picker-title-row">
                  <div><h3>{title}</h3></div>
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
          </div>
          <div className="wizard-navigation">
            <button type="button" className="wizard-icon-button wizard-button-secondary" aria-label="上一步" title="上一步" disabled={activeStep === 0} onClick={() => goToStep(activeStep - 1)}>‹</button>
            {activeStep < wizardSteps.length - 1 ? <button type="button" className="wizard-icon-button wizard-button-primary" aria-label="下一步" title="下一步" onClick={() => goToStep(activeStep + 1)}>›</button> : <button type="button" className="wizard-icon-button wizard-button-primary" aria-label="下載 PNG" title="下載 PNG" disabled={isExporting} onClick={handleDownload}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v4h14v-4" /></svg></button>}
          </div>
          {completionMessage && <p className="wizard-completion-message" role="status">{completionMessage}</p>}
        </aside>
      </section>

      <footer className="page-footer">
        <span>用一點閃耀，創作屬於你的故事 ✧</span>
        <span>BB寶石工作坊 · 開發預覽版</span>
      </footer>
      {isCompletionModalOpen && (
        <div className="completion-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCompletionModalOpen(false) }}>
          <section className="completion-modal" role="dialog" aria-modal="true" aria-labelledby="completion-modal-title">
            <button type="button" className="completion-modal-close" aria-label="關閉完成提示" onClick={() => setIsCompletionModalOpen(false)}>×</button>
            <p className="eyebrow">YOUR GEMSTONE IS READY</p>
            <h2 id="completion-modal-title">製作完成！</h2>
            <p className="completion-modal-copy">PNG 下載已開始！是張非常可愛的頭像呢 ♪</p>
            {exportPreview && <img className="completion-preview" src={exportPreview} alt="剛完成的寶石圖示預覽" />}
            {isExporting && <p className="completion-download-status" role="status">正在準備 PNG 檔案…</p>}
            {exportError && <p className="inline-error" role="alert">下載未能完成：{exportError}</p>}
            <div className="completion-modal-actions">
              <button type="button" className="wizard-button wizard-button-primary" onClick={() => {
                setSelections(defaultSelections)
                setVisible({ jewel: true, ribbon: true, character: true, metal: true, secondary: true, primary: true, pattern: true, colour: true })
                setPhoto({ image: null, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 })
                setActiveStep(0)
                setExportError('')
                setCompletionMessage('')
                setIsCompletionModalOpen(false)
              }}>再做一張</button>
              <button type="button" className="wizard-button wizard-button-secondary" onClick={() => setIsCompletionModalOpen(false)}>返回編輯</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
