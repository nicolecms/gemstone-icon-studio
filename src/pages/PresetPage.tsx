import { useEffect, useMemo, useRef, useState } from 'react'
import { getPresetSelections, gemstonePresets, type GemstonePreset } from '../data/presets'
import { renderIcon, type RenderConfig } from '../engine/renderIcon'
import './PageShell.css'

function presetConfig(preset: GemstonePreset): RenderConfig {
  return { ...getPresetSelections(preset), photo: { image: null, zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 } }
}

function PresetCanvas({ preset, className = '' }: { preset: GemstonePreset; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const config = useMemo(() => presetConfig(preset), [preset])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false

    const renderAtDisplayResolution = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      const pixelRatio = window.devicePixelRatio || 1
      const size = Math.max(1, Math.round(Math.min(width, height) * pixelRatio))
      void renderIcon(canvas, config, { size, shouldCancel: () => cancelled })
    }

    const observer = new ResizeObserver(renderAtDisplayResolution)
    observer.observe(canvas)
    window.addEventListener('resize', renderAtDisplayResolution)
    renderAtDisplayResolution()

    return () => {
      cancelled = true
      observer.disconnect()
      window.removeEventListener('resize', renderAtDisplayResolution)
    }
  }, [config])
  return <canvas ref={canvasRef} className={className} width={256} height={256} aria-label={preset.name + '預設頭像預覽'} />
}

export default function PresetPage() {
  const [selectedId, setSelectedId] = useState(gemstonePresets[0].id)
  const selected = gemstonePresets.find((preset) => preset.id === selectedId) ?? gemstonePresets[0]

  return (
    <main className="studio preset-page" lang="zh-Hant">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="BB寶石工作坊首頁">
          <span className="wordmark-gem" aria-hidden="true">✧</span>
          <span>BB寶石 <span className="wordmark-light">工作坊</span></span>
        </a>
        <span className="topbar-note">與BB們齊手打造獨一無二的寶石頭像</span>
      </header>
      <a className="back-home-link" href="/"><span aria-hidden="true">‹</span> 返回主頁</a>

      <section className="editor preset-editor" aria-label="預設款式選擇工作區">
        <div className="preview-column preset-preview-column">
          <div className="section-heading preview-heading">
            <div><p className="eyebrow">即時預覽</p><h2>你的寶石頭像</h2></div>
          </div>
          <div className="preview-stage canvas-stage preset-preview-stage">
            <PresetCanvas preset={selected} className="icon-canvas preset-main-canvas" />
          </div>
          <div className="preset-preview-caption">
            <strong>{selected.name}</strong>
            {selected.birthMonth !== null && <span>{selected.birthMonth} 月誕生石</span>}
          </div>
        </div>

        <aside className="controls-column preset-controls-column">
          <div className="sidebar-heading">
            <div><p className="eyebrow">選擇你的預設款式</p><h2>生日寶石系列</h2></div>
            <span className="step-count">{gemstonePresets.findIndex((preset) => preset.id === selected.id) + 1}/{gemstonePresets.length}</span>
          </div>
          <p className="preset-intro">選擇喜歡的生日寶石，預覽會即時更新。</p>
          <div className="picker-divider" aria-hidden="true" />
          <div className="preset-card-scroll">
            <div className="preset-card-grid" role="listbox" aria-label="選擇預設款式">
              {gemstonePresets.map((preset, index) => (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={selected.id === preset.id}
                  aria-pressed={selected.id === preset.id}
                  className={`preset-card ${selected.id === preset.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedId(preset.id)}
                >
                  <span className="preset-card-art">
                    <img src={`/assets/presets/preset-${index + 1}.PNG`} alt="" loading="lazy" />
                  </span>
                  <span className="preset-card-name">{preset.name}</span>
                  {preset.birthMonth !== null && <span className="preset-card-month">{preset.birthMonth} 月誕生石</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="preset-actions">
            <a className="wizard-button wizard-button-primary" href={`/editor?preset=${selected.id}`}>進一步自訂</a>
            <a className="wizard-button wizard-button-secondary" href={`/editor?preset=${selected.id}&export=1`}>直接下載</a>
          </div>
        </aside>
      </section>
      <footer className="page-footer"><span>用一點閃耀，創作屬於你的故事 ✧</span><span>小寶石工作室 · 開發預覽版</span></footer>
    </main>
  )
}
