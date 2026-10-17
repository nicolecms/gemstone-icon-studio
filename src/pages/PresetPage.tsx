import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getPresetSelections, gemstonePresets, type GemstonePreset } from '../data/presets'
import { readPhotoSession, savePhotoSession, type PersistedPhoto } from '../data/photoSession'
import { renderIcon, type RenderConfig } from '../engine/renderIcon'
import './PageShell.css'

const emptyPhoto = { image: null, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 }

function presetConfig(preset: GemstonePreset, photo: RenderConfig['photo']): RenderConfig {
  return { ...getPresetSelections(preset), photo }
}

function PresetCanvas({ config, className = '', onPointerDown, onPointerMove, onPointerUp }: {
  config: RenderConfig
  className?: string
  onPointerDown?: (event: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerMove?: (event: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerUp?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    const render = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      void renderIcon(canvas, config, { size: Math.max(1, Math.round(Math.min(rect.width, rect.height) * (window.devicePixelRatio || 1))), shouldCancel: () => cancelled })
    }
    const observer = new ResizeObserver(render)
    observer.observe(canvas)
    render()
    return () => { cancelled = true; observer.disconnect() }
  }, [config])
  return <canvas ref={canvasRef} className={className} width={256} height={256} aria-label="寶石頭像即時預覽；可拖曳照片調整位置" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('無法讀取圖片'))
    reader.onerror = () => reject(new Error('無法讀取圖片'))
    reader.readAsDataURL(file)
  })
}

function imageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('無法載入圖片'))
    image.src = dataUrl
  })
}

export default function PresetPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedId, setSelectedId] = useState(gemstonePresets[0].id)
  const [photo, setPhoto] = useState<RenderConfig['photo']>(emptyPhoto)
  const [photoFileName, setPhotoFileName] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [isCustomConfirmOpen, setIsCustomConfirmOpen] = useState(false)
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const selected = gemstonePresets.find((preset) => preset.id === selectedId) ?? gemstonePresets[0]
  const isCustom = selectedId === 'custom'
  const previewConfig = useMemo(() => presetConfig(selected, photo), [selected, photo])

  useEffect(() => {
    const saved = readPhotoSession()
    if (!saved) return
    void imageFromDataUrl(saved.dataUrl).then((image) => {
      setPhoto({ image, zoom: saved.zoom, rotation: saved.rotation, offsetX: saved.offsetX, offsetY: saved.offsetY })
      setPhotoFileName(saved.fileName)
    }).catch(() => {})
  }, [])

  const persistPhoto = useCallback(async (nextPhoto: RenderConfig['photo'], fileName: string) => {
    if (!nextPhoto.image) return
    try {
      let dataUrl: string
      if (nextPhoto.image.src.startsWith('data:')) dataUrl = nextPhoto.image.src
      else dataUrl = await fileToDataUrl(await (await fetch(nextPhoto.image.src)).blob())
      const payload: PersistedPhoto = { dataUrl, fileName, zoom: nextPhoto.zoom, rotation: nextPhoto.rotation, offsetX: nextPhoto.offsetX, offsetY: nextPhoto.offsetY }
      if (!savePhotoSession(payload)) setPhotoError('圖片較大，未能暫存於本次工作階段。請嘗試較小的圖片。')
    } catch {
      setPhotoError('未能暫存圖片，請重新上載。')
    }
  }, [])

  useEffect(() => {
    if (photo.image) void persistPhoto(photo, photoFileName)
  }, [photo, photoFileName, persistPhoto])

  const uploadPhoto = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setPhotoError('請選擇有效的圖片檔案。'); return }
    try {
      const dataUrl = await fileToDataUrl(file)
      const image = await imageFromDataUrl(dataUrl)
      const next = { image, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 }
      setPhoto(next)
      setPhotoFileName(file.name)
      setPhotoError('')
      savePhotoSession({ dataUrl, fileName: file.name, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 })
    } catch { setPhotoError('無法讀取這張圖片，請嘗試另一個檔案。') }
  }

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photo.image) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX: photo.offsetX, offsetY: photo.offsetY }
  }
  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return
    const scale = 1024 / Math.max(1, event.currentTarget.getBoundingClientRect().width)
    setPhoto(current => ({ ...current, offsetX: dragRef.current!.offsetX + (event.clientX - dragRef.current!.x) * scale, offsetY: dragRef.current!.offsetY + (event.clientY - dragRef.current!.y) * scale }))
  }
  const pointerUp = () => { dragRef.current = null }

  const continueToEditor = () => {
    void persistPhoto(photo, photoFileName).finally(() => { window.location.href = '/editor?preset=' + selected.id + '&step=1' })
  }
  const confirmPresetExport = () => setIsExportConfirmOpen(true)
  const startPresetExport = () => {
    void persistPhoto(photo, photoFileName).finally(() => { window.location.href = '/editor?preset=' + selected.id + '&export=1' })
  }

  return (
    <main className="studio preset-page" lang="zh-Hant">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="BB寶石工作坊首頁"><span className="wordmark-gem" aria-hidden="true">✧</span><span>BB寶石 <span className="wordmark-light">工作坊</span></span></a>
        <span className="topbar-note">與BB們齊手打造獨一無二的寶石頭像</span>
      </header>
      <a className="back-home-link" href="/"><span aria-hidden="true">‹</span> 返回主頁</a>

      <section className={`editor preset-editor ${step === 1 ? 'preset-photo-step' : 'preset-choice-step'}`} aria-label="預設款式選擇工作區">
        <div className={'preview-column preset-preview-column ' + (isCustom ? 'is-dimmed' : '')}>
          <div className="section-heading preview-heading"><div><p className="eyebrow">即時預覽</p><h2>你的寶石頭像</h2></div></div>
          <div className="preview-stage canvas-stage preset-preview-stage">
            <PresetCanvas config={previewConfig} className="icon-canvas preset-main-canvas" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} />
          </div>
        </div>

        <aside className={'controls-column preset-controls-column ' + (sheetExpanded ? 'is-expanded' : '')}>
          <div className="mobile-sheet-handle" role="button" tabIndex={0} aria-label={sheetExpanded ? '收起選項面板' : '展開選項面板'} aria-expanded={sheetExpanded} onPointerDown={event => { setIsDragging(true); dragRef.current = { x: event.clientX, y: event.clientY, offsetX: 0, offsetY: 0 }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerUp={event => { if (isDragging && dragRef.current && Math.abs(event.clientY - dragRef.current.y) > 20) setSheetExpanded(event.clientY < dragRef.current.y); else setSheetExpanded(value => !value); setIsDragging(false); dragRef.current = null }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSheetExpanded(value => !value) } }}><span /></div>
          <div className="sidebar-heading">
            <div><p className="eyebrow">{step === 1 ? '自訂你的頭像' : '選擇你的預設款式'}</p><h2>{step === 1 ? '上載及編輯照片' : '選擇設計模板'}</h2></div>
            <span className="step-count">{step}/2</span>
          </div>
          <div className="picker-divider" aria-hidden="true" />
          <div className="preset-card-scroll">
            {step === 1 ? (
              <section className="photo-tools" aria-label="照片編輯">
                <div className="photo-upload-section">
                  <h3>上載照片</h3>
                  <input ref={photoInputRef} className="photo-file-input" type="file" accept="image/*" onChange={event => { void uploadPhoto(event.currentTarget.files?.[0]); event.currentTarget.value = '' }} />
                  {photo.image ? <div className="uploaded-photo"><p className="uploaded-photo-name" title={photoFileName}>{photoFileName}</p><div className="photo-actions"><button type="button" onClick={() => photoInputRef.current?.click()}>更換圖片</button><button type="button" onClick={() => { setPhoto(emptyPhoto); setPhotoFileName('') }}>移除圖片</button></div></div> : <button type="button" className="upload-button" onClick={() => photoInputRef.current?.click()}>選擇圖片</button>}
                </div>
                <div className="photo-edit-section">
                  <h3>編輯照片</h3><p className="photo-help">在預覽上拖曳照片以移動位置。照片會裁切於固定圓形範圍內。</p>
                  <label className="photo-control">縮放 <input type="range" min="1" max="4" step="0.05" value={photo.zoom} onChange={event => setPhoto(current => ({ ...current, zoom: Number(event.target.value) }))} /><span>{photo.zoom.toFixed(2)}×</span></label>
                  <label className="photo-control">旋轉 <input type="range" min="-180" max="180" step="1" value={photo.rotation} onChange={event => setPhoto(current => ({ ...current, rotation: Number(event.target.value) }))} /><span>{photo.rotation}°</span></label>
                  <div className="photo-actions"><button type="button" onClick={() => setPhoto(current => ({ ...current, zoom: 1, offsetX: 0, offsetY: 0 }))}>符合遮罩範圍</button><button type="button" onClick={() => setPhoto(current => ({ ...current, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 }))}>重設照片</button></div>
                  {photoError && <p className="inline-error" role="alert">{photoError}</p>}
                </div>
              </section>
            ) : (
              <div className="preset-card-grid" role="listbox" aria-label="選擇預設款式">
                {gemstonePresets.map((preset, index) => <button key={preset.id} type="button" role="option" aria-selected={selectedId === preset.id} className={`preset-card ${selectedId === preset.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(preset.id)}>
                  <span className="preset-card-art"><img src={`/assets/presets/preset_${index + 1}.PNG`} alt="" loading="lazy" /></span>
                  <span className="preset-card-name">{preset.name}</span>
                  {preset.birthMonth !== null && <span className="preset-card-month">{preset.birthMonth} 月誕生石</span>}
                </button>)}
                <button type="button" role="option" aria-selected={isCustom} className={`preset-card preset-custom-card ${isCustom ? 'is-selected' : ''}`} onClick={() => setSelectedId('custom')}>
                  <span className="preset-card-art"><img src="/assets/presets/preset_15.PNG" alt="" loading="lazy" /></span>
                  <span className="preset-card-name">自定義</span><span className="preset-card-month">將跳轉至定製頁</span>
                </button>
              </div>
            )}
          </div>
          <div className="preset-actions">
            {step === 1 ? <><button type="button" className="wizard-button wizard-button-secondary" onClick={() => { if (photo.image) void persistPhoto(photo, photoFileName); window.location.href = '/' }}>返回主頁</button><button type="button" className="wizard-button wizard-button-primary preset-tick-button" aria-label="下一步" onClick={() => { if (photo.image) void persistPhoto(photo, photoFileName); setStep(2); setSheetExpanded(false) }}><span aria-hidden="true">✓</span></button></> :
              <><button type="button" className="wizard-button wizard-button-secondary" onClick={() => setStep(1)}>上一步</button><button type="button" className="wizard-button wizard-button-primary preset-tick-button" aria-label="確認選擇" onClick={() => isCustom ? setIsCustomConfirmOpen(true) : confirmPresetExport()}><span aria-hidden="true">✓</span></button></>}
          </div>
        </aside>
      </section>

      <footer className="page-footer"><span>用一點閃耀，創作屬於你的故事 ✧</span><span>小寶石工作室 · 開發預覽版</span></footer>

      {isCustomConfirmOpen && <div className="completion-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setIsCustomConfirmOpen(false) }}><section className="completion-modal" role="dialog" aria-modal="true" aria-labelledby="custom-confirm-title"><button type="button" className="completion-modal-close" aria-label="關閉確認視窗" onClick={() => setIsCustomConfirmOpen(false)}>×</button><p className="eyebrow">CUSTOM DESIGN</p><h2 id="custom-confirm-title">前往定製頁？</h2><p className="completion-modal-copy">你將前往定製頁，可以繼續調整寶石頭像。要現在前往嗎？</p><div className="completion-modal-actions"><button type="button" className="wizard-button wizard-button-primary" onClick={continueToEditor}>確認前往</button><button type="button" className="wizard-button wizard-button-secondary" onClick={() => setIsCustomConfirmOpen(false)}>返回選擇</button></div></section></div>}
      {isExportConfirmOpen && <div className="completion-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setIsExportConfirmOpen(false) }}><section className="completion-modal" role="dialog" aria-modal="true" aria-labelledby="preset-export-title"><button type="button" className="completion-modal-close" aria-label="關閉確認視窗" onClick={() => setIsExportConfirmOpen(false)}>×</button><p className="eyebrow">YOUR GEMSTONE IS READY</p><h2 id="preset-export-title">確認並預覽頭像</h2><p className="completion-modal-copy">將使用已選擇的預設款式及你上載的照片。下一步可預覽並確認下載。</p><div className="completion-modal-actions"><button type="button" className="wizard-button wizard-button-primary" onClick={startPresetExport}>確認</button><button type="button" className="wizard-button wizard-button-secondary" onClick={() => setIsExportConfirmOpen(false)}>返回編輯</button></div></section></div>}
    </main>
  )
}
