import './App.css'

const steps = [
  { number: '01', label: 'Jewel', detail: 'A little sparkle' },
  { number: '02', label: 'Ribbon', detail: 'Tie it together' },
  { number: '03', label: 'Character', detail: 'Add personality' },
  { number: '04', label: 'Frame', detail: 'Build your setting' },
  { number: '05', label: 'Your photo', detail: 'Make it yours' },
  { number: '06', label: 'Background', detail: 'Set the mood' },
]

function App() {
  return (
    <main className="studio">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Gemstone Studio home">
          <span className="wordmark-gem" aria-hidden="true">✧</span>
          <span>little gem <span className="wordmark-light">studio</span></span>
        </a>
        <span className="topbar-note">A tiny treasure, made by you</span>
        <button className="text-button" type="button" disabled>Start over</button>
      </header>

      <section className="intro">
        <p className="eyebrow">YOUR ICON, YOUR BIRTHSTONE ENERGY</p>
        <h1>Make a little <span>magic.</span></h1>
        <p className="intro-copy">Build a one-of-a-kind icon, one lovely detail at a time.</p>
      </section>

      <section className="editor" aria-label="Icon customiser">
        <div className="preview-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE BIG PICTURE</p>
              <h2>Your little gem</h2>
            </div>
            <span className="draft-pill"><span /> Preview</span>
          </div>

          <div className="preview-stage">
            <div className="preview-halo halo-one" />
            <div className="preview-halo halo-two" />
            <div className="preview-placeholder" aria-label="Icon preview placeholder">
              <div className="placeholder-inner">
                <span className="placeholder-sparkle sparkle-one">✦</span>
                <span className="placeholder-sparkle sparkle-two">✧</span>
                <span className="placeholder-face">♡</span>
                <span className="placeholder-caption">your photo<br />goes here</span>
              </div>
              <span className="placeholder-gem gem-top">✧</span>
              <span className="placeholder-gem gem-side">✦</span>
            </div>
            <p className="preview-hint">Your design will come to life here</p>
          </div>

          <div className="preview-footer">
            <span><span className="status-dot" /> Changes will appear here</span>
            <span>Square icon · 1024 × 1024 px export planned</span>
          </div>
        </div>

        <aside className="controls-column">
          <div className="section-heading controls-heading">
            <div>
              <p className="eyebrow">MAKE IT YOURS</p>
              <h2>Customise</h2>
            </div>
            <span className="step-count">6 layers</span>
          </div>

          <p className="panel-intro">Every detail adds a little more you. Pick a layer to get started.</p>

          <div className="layer-list">
            {steps.map((step, index) => (
              <button
                className="layer-row"
                type="button"
                key={step.number}
                disabled
                aria-label={`${step.label} customisation coming soon`}
              >
                <span className={`layer-number ${index === 0 ? 'layer-number-active' : ''}`}>{step.number}</span>
                <span className="layer-copy">
                  <span className="layer-label">{step.label}</span>
                  <span className="layer-detail">{step.detail}</span>
                </span>
                <span className="layer-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className="coming-soon">
            <span className="coming-soon-icon" aria-hidden="true">✳</span>
            <div>
              <p>Lovely things are on the way</p>
              <span>We're setting up your creative space.</span>
            </div>
          </div>
        </aside>
      </section>

      <footer className="page-footer">
        <span>Made with a little bit of sparkle ✧</span>
        <span>Gemstone Icon Studio · Early preview</span>
      </footer>
    </main>
  )
}

export default App
