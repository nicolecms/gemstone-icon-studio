import './PageShell.css'

export default function HomePage() {
  return (
    <main className="page-shell" lang="zh-Hant">
      <header className="page-shell-header">
        <a className="page-shell-brand" href="/">✧ <span>BB寶石 <em>工作坊</em></span></a>
        <span>與BB們齊手打造獨一無二的寶石頭像</span>
      </header>
      <section className="page-shell-card">
        <p className="page-shell-eyebrow">BB GEMSTONE STUDIO</p>
        <h1>為日常添一點寶石魔法。</h1>
        <p>打造專屬於你的生日寶石頭像，讓每一份閃耀都與眾不同。</p>
        <div className="page-shell-actions">
          <a className="page-shell-primary" href="/presets">選擇預設款式</a>
          <a className="page-shell-secondary" href="/editor">自訂我的頭像</a>
        </div>
      </section>
      <footer className="page-shell-footer">用一點閃耀，創作屬於你的故事 ✧</footer>
    </main>
  )
}
