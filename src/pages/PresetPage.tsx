import './PageShell.css'

export default function PresetPage() {
  return (
    <main className="page-shell" lang="zh-Hant">
      <header className="page-shell-header">
        <a className="page-shell-brand" href="/">✧ <span>BB寶石 <em>工作坊</em></span></a>
        <a className="page-shell-secondary" href="/">返回主頁</a>
      </header>
      <section className="page-shell-card">
        <p className="page-shell-eyebrow">FIND YOUR GEM</p>
        <h1>選擇你的預設款式</h1>
        <p>預設款式即將登場。你可以先進入自訂工作坊，打造專屬的寶石頭像。</p>
        <div className="page-shell-actions">
          <a className="page-shell-primary" href="/editor">開始自訂</a>
          <a className="page-shell-secondary" href="/">返回主頁</a>
        </div>
      </section>
      <footer className="page-shell-footer">BB寶石工作坊 · 開發預覽版</footer>
    </main>
  )
}
