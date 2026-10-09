import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { assetManifest, defaultSelections, layerOrderBottomToTop } from './data/assetManifest'
import { renderIcon, type RenderConfig } from './engine/renderIcon'
import './App.css'

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

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [assetErrors, setAssetErrors] = useState<string[]>([])
  const [renderError, setRenderError] = useState('')
  const [isRendering, setIsRendering] = useState(true)

  const config = useMemo<RenderConfig>(() => ({
    colour: defaultSelections.colour,
    pattern: defaultSelections.pattern,
    photo: {
      image: null,
      zoom: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    },
    metal: defaultSelections.metal,
    secondary: defaultSelections.secondary,
    primary: defaultSelections.primary,
    character: defaultSelections.character,
    ribbon: defaultSelections.ribbon,
    jewel: defaultSelections.jewel,
  }), [])

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
    })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRenderError(error instanceof Error ? error.message : '繪製圖示時發生未知錯誤。')
        }
      })
      .finally(() => {
        if (!cancelled) setIsRendering(false)
      })

    return () => {
      cancelled = true
    }
  }, [config, handleAssetError])

  const assetCounts = [
    { label: '寶石', count: assetManifest.jewel.length },
    { label: '絲帶', count: assetManifest.ribbon.length },
    { label: '角色', count: assetManifest.character.length },
    { label: '金屬框', count: assetManifest.metal.length },
    { label: '次要框', count: assetManifest.secondary.length },
    { label: '主要框', count: assetManifest.primary.length },
    { label: '背景圖案', count: assetManifest.pattern.length },
    { label: '純色背景', count: assetManifest.colours.length },
  ]

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
        <p className="intro-copy">從每一個小細節開始，打造獨一無二的個人圖示。</p>
      </section>

      <section className="editor" aria-label="圖示自訂工作區">
        <div className="preview-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">即時預覽</p>
              <h2>你的專屬寶石</h2>
            </div>
            <span className="draft-pill"><span />{isRendering ? '繪製中' : '預覽畫布'}</span>
          </div>

          <div className="preview-stage canvas-stage">
            <div className="preview-halo halo-one" />
            <div className="preview-halo halo-two" />
            <canvas
              ref={canvasRef}
              className="icon-canvas"
              width={1024}
              height={1024}
              aria-label="寶石圖示畫布預覽"
            />
          </div>

          <div className="preview-footer">
            <span><span className="status-dot" />{isRendering ? '正在繪製圖層…' : '畫布已完成繪製'}</span>
            <span>預計匯出尺寸：1024 × 1024 px</span>
          </div>

          {renderError && (
            <div className="error-panel" role="alert">
              <strong>無法繪製畫布</strong>
              <p>{renderError}</p>
            </div>
          )}

          {assetErrors.length > 0 && (
            <div className="warning-panel" role="status">
              <strong>部分素材尚未載入（{assetErrors.length}）</strong>
              <p>目前素材資料夾尚未放入對應圖片，因此畫布會先顯示背景與示意照片。請依照下方路徑加入素材；其餘圖層仍會繼續繪製。</p>
              <ul>
                {assetErrors.slice(0, 5).map((src) => <li key={src}><code>{src}</code></li>)}
              </ul>
              {assetErrors.length > 5 && <p>另有 {assetErrors.length - 5} 個素材路徑未能載入。</p>}
            </div>
          )}
        </div>

        <aside className="controls-column">
          <div className="section-heading controls-heading">
            <div>
              <p className="eyebrow">素材設定</p>
              <h2>圖層清單</h2>
            </div>
            <span className="step-count">共 9 層</span>
          </div>

          <p className="panel-intro">目前先使用每個圖層的第一款預設素材。下一階段會加入素材選擇與照片編輯功能。</p>

          <div className="layer-list">
            {layerOrderBottomToTop.map((layer, index) => (
              <div className="layer-row layer-row-static" key={layer}>
                <span className={`layer-number ${index === layerOrderBottomToTop.length - 1 ? 'layer-number-active' : ''}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="layer-copy">
                  <span className="layer-label">{layerLabels[layer]}</span>
                  <span className="layer-detail">
                    {layer === 'colour' ? defaultSelections.colour.label
                      : layer === 'pattern' ? defaultSelections.pattern.label
                      : layer === 'photo' ? '示意照片 · 圓形裁切'
                      : defaultSelections[layer].label}
                  </span>
                </span>
                <span className="layer-order-tag">{index === 0 ? '底層' : index === layerOrderBottomToTop.length - 1 ? '頂層' : `第 ${index + 1} 層`}</span>
              </div>
            ))}
          </div>

          <div className="manifest-panel">
            <h3>素材清單</h3>
            <p>目前已在程式中設定的素材數量：</p>
            <div className="asset-count-grid">
              {assetCounts.map((item) => (
                <div className="asset-count" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>
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
