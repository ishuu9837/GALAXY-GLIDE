import { useEffect, useRef, useState } from 'react'
import Scene from './Scene.js'
import { BODIES, rankOf, MAX_XP } from './data.js'

const SEED = [['Nova Reyes',520],['Kip Okafor',410],['Mira Sato',300],['Juno Park',210],['Tae Lindqvist',120]]
const load = () => { try { return JSON.parse(localStorage.getItem('gg2')) || {} } catch { return {} } }

export default function App() {
  const saved = useRef(load()).current
  const [screen, setScreen] = useState('home')
  const [sel, setSel] = useState(null)
  const [seen, setSeen] = useState(saved.seen || [])
  const [won, setWon] = useState(saved.won || [])
  const [name, setName] = useState(saved.name || 'Pilot')
  const [speed, setSpeed] = useState(1)
  const [paused, setPaused] = useState(false)
  const [orbits, setOrbits] = useState(true)
  const [labels, setLabels] = useState(true)
  const [pick, setPick] = useState(null)
  const canvas = useRef(), tags = useRef(), sc = useRef()
  const xp = seen.length * 10 + won.length * 50

  useEffect(() => {
    sc.current = new Scene(canvas.current, tags.current, n => { setSel(n); setPick(null); if (n) setSeen(s => s.includes(n) ? s : [...s, n]) })
    return () => sc.current.dispose()
  }, [])
  useEffect(() => { try { localStorage.setItem('gg2', JSON.stringify({ seen, won, name })) } catch {} }, [seen, won, name])
  useEffect(() => { const s = sc.current; s.speed = speed; s.paused = paused; s.setOrbits(orbits); s.showLabels = labels && screen === 'explore' }, [speed, paused, orbits, labels, screen])
  useEffect(() => { sc.current.setIdle(screen !== 'explore'); if (screen !== 'explore') sc.current.overview() }, [screen])

  const body = BODIES.find(b => b.name === sel)
  const board = [...SEED, [name + ' (you)', xp]].sort((a, b) => b[1] - a[1])
  const answer = i => { setPick(i); if (i === body.q.a) setWon(w => w.includes(sel) ? w : [...w, sel]) }
  const reset = () => { setSeen([]); setWon([]); setSel(null) }

  return (
    <>
      <canvas ref={canvas} className="gl" />
      <div ref={tags} className="tags" />
      {screen === 'home' && (
        <main className="home">
          <h1>Galaxy<br />Glide</h1>
          <p>Fly through our solar system, touch every world, and test what you learn. Nine worlds, 540 XP, one rank to earn.</p>
          <div className="row">
            <button className="btn hot" onClick={() => setScreen('explore')}>Launch mission</button>
            <button className="btn" onClick={() => setScreen('board')}>Leaderboard</button>
            <button className="btn" onClick={() => setScreen('settings')}>Settings</button>
          </div>
          <div className="pilot"><b>{name}</b> · {rankOf(xp)} · {xp} XP</div>
        </main>
      )}
      {screen === 'explore' && (
        <>
          <header className="top">
            <button className="btn sm" onClick={() => setScreen('home')}>Home</button>
            <div className="xp"><span>{rankOf(xp)}</span><i><u style={{ width: Math.min(100, xp / MAX_XP * 100) + '%' }} /></i><span>{xp} XP</span></div>
          </header>
          <nav className="rail" aria-label="Worlds">
            {BODIES.map(b => (
              <button key={b.name} className={sel === b.name ? 'on' : ''} onClick={() => sc.current.select(b.name)}>
                <span className="dot" style={{ background: b.c }} />{b.name}
                {won.includes(b.name) ? <em>★</em> : seen.includes(b.name) && <em>✓</em>}
              </button>
            ))}
          </nav>
          {body && (
            <aside className="card" key={sel}>
              <h2>{body.name}</h2>
              <p>{body.info}</p>
              <dl>{Object.entries(body.facts).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              {won.includes(sel) ? <div className="ok">Quiz complete. +50 XP earned.</div> : (
                <div className="quiz">
                  <b>{body.q.q}</b>
                  {body.q.o.map((o, i) => (
                    <button key={o} disabled={pick !== null && pick === body.q.a} onClick={() => answer(i)}
                      className={pick === i ? (i === body.q.a ? 'right' : 'wrong') : ''}>{o}</button>
                  ))}
                  {pick !== null && pick !== body.q.a && <small>Not quite. Try another answer.</small>}
                </div>
              )}
            </aside>
          )}
          <footer className="dock">
            <button className="btn sm" onClick={() => sc.current.overview()}>Overview</button>
            <button className="btn sm" onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button>
            <label>Time <input type="range" min=".2" max="8" step=".2" value={speed} onChange={e => setSpeed(+e.target.value)} /> {speed}×</label>
            <button className={'btn sm' + (orbits ? ' hot' : '')} onClick={() => setOrbits(!orbits)}>Orbits</button>
            <button className={'btn sm' + (labels ? ' hot' : '')} onClick={() => setLabels(!labels)}>Labels</button>
          </footer>
        </>
      )}
      {(screen === 'board' || screen === 'settings') && (
        <div className="veil" onClick={() => setScreen('home')}>
          <section className="modal" onClick={e => e.stopPropagation()}>
            {screen === 'board' ? (
              <>
                <h2>Leaderboard</h2>
                <ol>{board.map(([n, s], i) => <li key={n} className={n.endsWith('(you)') ? 'me' : ''}><span>{i + 1}</span><b>{n}</b><em>{rankOf(s)}</em><strong>{s} XP</strong></li>)}</ol>
                <p className="muted">Scores are stored on this device.</p>
              </>
            ) : (
              <>
                <h2>Settings</h2>
                <label className="f">Pilot name<input value={name} maxLength={16} onChange={e => setName(e.target.value || 'Pilot')} /></label>
                <label className="f">Orbit speed: {speed}×<input type="range" min=".2" max="8" step=".2" value={speed} onChange={e => setSpeed(+e.target.value)} /></label>
                <div className="row"><button className={'btn sm' + (orbits ? ' hot' : '')} onClick={() => setOrbits(!orbits)}>Orbit lines</button>
                  <button className={'btn sm' + (labels ? ' hot' : '')} onClick={() => setLabels(!labels)}>World labels</button></div>
                <button className="btn sm danger" onClick={reset}>Reset progress</button>
              </>
            )}
            <button className="btn sm" onClick={() => setScreen('home')}>Close</button>
          </section>
        </div>
      )}
    </>
  )
}
