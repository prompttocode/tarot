import { memo, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Bookmark, Check, ChevronLeft, ChevronRight,
  Activity, BriefcaseBusiness, Coins, Compass, Grid2X2, Heart, MoonStar, RotateCcw, Search, Sparkles, X,
} from 'lucide-react'
import deckData from './data/decks.json'
import { readingAdvice } from './data/advice'
import { meaningFor, type Card } from './data/meanings'
import { readingSourceFor } from './data/sources'

type Deck = { id: string; name: string; count: number; license: string; cover: string | null; cards: Card[] }
type Tab = 'home' | 'reading' | 'library' | 'journal'
type Phase = 'setup' | 'draw' | 'result'
type SavedReading = {
  id: string
  date: string
  deckId: string
  spread: 1 | 3
  question: string
  topic?: string | null
  cards: Card[]
}

const decks = deckData as Deck[]
const featuredDeck = decks.find((item) => item.id === 'rider-waite') || decks[0]
const positions = ['Năng lượng hiện tại', 'Điều đang ảnh hưởng', 'Hướng để bước tiếp']
const rotatingWords = ['hiểu mình hơn.', 'chọn lối đi.', 'lắng nghe lòng.']
function fanOffset(index: number, position: number, count: number) {
  let offset = index - position
  while (offset > count / 2) offset -= count
  while (offset < -count / 2) offset += count
  return offset
}

function wrapFanIndex(index: number, count: number) {
  return ((index % count) + count) % count
}
const topics = [
  { label: 'Tình cảm', icon: Heart, hint: 'Lắng nghe trái tim' },
  { label: 'Công việc', icon: BriefcaseBusiness, hint: 'Tìm hướng đi mới' },
  { label: 'Sức khỏe', icon: Activity, hint: 'Chăm sóc chính mình' },
  { label: 'Tài chính', icon: Coins, hint: 'Nhìn rõ ưu tiên' },
]

function loadJournal(): SavedReading[] {
  try {
    const saved = JSON.parse(localStorage.getItem('la-tarot-journal') || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function shuffled<T,>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function imageAlt(card: Card) {
  return `Lá bài ${card.name}`
}

function toAssetUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const clean = url.startsWith('/') ? url.slice(1) : url
  const base = import.meta.env.BASE_URL || './'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}${clean}`
}

function CardFace({ card, deckId, className = '' }: { card: Card; deckId: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className={`card-face ${className}`}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse' || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        ref.current.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
        ref.current.style.setProperty('--ry', `${(x - 0.5) * 10}deg`)
        ref.current.style.setProperty('--mx', `${x * 100}%`)
        ref.current.style.setProperty('--my', `${y * 100}%`)
      }}
      onPointerLeave={() => {
        if (!ref.current) return
        ref.current.style.setProperty('--rx', '0deg')
        ref.current.style.setProperty('--ry', '0deg')
      }}
    >
      <img src={toAssetUrl(card.image)} alt={imageAlt(card)} loading="lazy" draggable="false" />
      <span className="card-face__sheen" aria-hidden="true" />
      <span className="sr-only">{meaningFor(card, deckId).title}</span>
    </div>
  )
}

const CardBack = memo(function CardBack({ deck, className = '' }: { deck: Deck; className?: string }) {
  return (
    <div className={`card-back ${className}`}>
      {deck.cover ? <img src={toAssetUrl(deck.cover)} alt="" draggable="false" /> : <div className="card-back__pattern" aria-hidden="true">✧<span>☼</span>✧</div>}
      <span className="card-back__border" aria-hidden="true" />
    </div>
  )
})

function FanCarousel({ deck, count, initialPosition, selectedFan, onPositionMove, onPositionSettle, onSelect }: {
  deck: Deck
  count: number
  initialPosition: number
  selectedFan: { index: number; dx: number; dy: number } | null
  onPositionMove: (position: number) => void
  onPositionSettle: (position: number) => void
  onSelect: (index: number, element: HTMLButtonElement) => void
}) {
  const [position, setPosition] = useState(initialPosition)
  const [dragging, setDragging] = useState(false)
  const positionRef = useRef(initialPosition)
  const targetPosition = useRef(initialPosition)
  const frame = useRef<number | null>(null)
  const gesture = useRef<{ x: number; position: number; moved: boolean; lastPosition: number; lastTime: number; velocity: number } | null>(null)

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current) }, [])

  function schedulePosition(next: number) {
    targetPosition.current = next
    positionRef.current = next
    onPositionMove(next)
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      setPosition(targetPosition.current)
    })
  }

  function finishGesture() {
    const current = gesture.current
    if (!current) return
    if (current.moved) {
      const projected = positionRef.current + Math.max(-1.5, Math.min(1.5, current.velocity * 120))
      const settled = wrapFanIndex(Math.round(projected), count)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
      targetPosition.current = settled
      positionRef.current = settled
      setPosition(settled)
      onPositionMove(settled)
      onPositionSettle(settled)
      window.setTimeout(() => { if (gesture.current === current) gesture.current = null }, 160)
    } else {
      gesture.current = null
    }
    setDragging(false)
  }

  const visibleIndices = Array.from({ length: count }, (_, index) => index)
    .filter((index) => Math.abs(fanOffset(index, position, count)) < 7.2)

  return <div className={`draw-fan ${selectedFan ? 'is-selecting' : ''} ${dragging ? 'is-dragging' : ''}`}
    aria-label={`Vuốt ngang để xoay toàn bộ ${count} lá bài rồi chạm để chọn`}
    onPointerDown={(event) => {
      if (selectedFan) return
      gesture.current = { x: event.clientX, position: positionRef.current, moved: false, lastPosition: positionRef.current, lastTime: performance.now(), velocity: 0 }
    }}
    onPointerMove={(event) => {
      const current = gesture.current
      if (!current || selectedFan) return
      if (Math.abs(event.clientX - current.x) > 9 && !current.moved) {
        current.moved = true
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      if (!current.moved) return
      const next = current.position - (event.clientX - current.x) / 48
      const now = performance.now()
      current.velocity = (next - current.lastPosition) / Math.max(1, now - current.lastTime)
      current.lastPosition = next
      current.lastTime = now
      schedulePosition(next)
    }}
    onPointerUp={finishGesture}
    onPointerCancel={() => { gesture.current = null; setDragging(false) }}>
    {visibleIndices.map((index) => {
      const offset = fanOffset(index, position, count)
      const angle = offset * 0.16
      const x = 235 * Math.sin(angle)
      const y = 82 * (1 - Math.cos(angle)) / (1 - Math.cos(0.96))
      const picked = selectedFan?.index === index
      return <button className={`draw-fan__card ${picked ? 'is-picked' : ''}`} type="button" key={index} data-fan-index={index}
        style={{ '--arc-x': `${x}px`, '--arc-y': `${y}px`, '--arc-rotation': `${offset * 5.2}deg`, '--arc-scale': 1 - Math.abs(offset) * 0.022, '--arc-opacity': 1 - Math.abs(offset) * 0.025, '--lift-x': `${picked ? selectedFan.dx : 0}px`, '--lift-y': `${picked ? selectedFan.dy : 0}px`, zIndex: picked ? 40 : 30 - Math.round(Math.abs(offset) * 3) } as React.CSSProperties}
        onClick={(event) => { if (gesture.current?.moved) { gesture.current = null; return } onSelect(index, event.currentTarget) }}
        aria-label={`Chọn lá bài thứ ${index + 1} trong ${count} lá`} disabled={Boolean(selectedFan)}><CardBack deck={deck} /></button>
    })}
  </div>
}

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [phase, setPhase] = useState<Phase>('setup')
  const [deckId, setDeckId] = useState('soimoi')
  const [spread, setSpread] = useState<1 | 3>(1)
  const [question, setQuestion] = useState('')
  const [topic, setTopic] = useState<string | null>(null)
  const [queue, setQueue] = useState<Card[]>([])
  const [drawn, setDrawn] = useState<Card[]>([])
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [selectedFan, setSelectedFan] = useState<{ index: number; dx: number; dy: number } | null>(null)
  const [fanPosition, setFanPosition] = useState(6)
  const [resultIndex, setResultIndex] = useState(0)
  const [journal, setJournal] = useState<SavedReading[]>(loadJournal)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [libraryDeckId, setLibraryDeckId] = useState('soimoi')
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryLimit, setLibraryLimit] = useState(24)
  const [libraryCard, setLibraryCard] = useState<Card | null>(null)
  const [wordIndex, setWordIndex] = useState(0)
  const timer = useRef<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const fanPositionRef = useRef(6)

  const deck = decks.find((item) => item.id === deckId) || decks[0]
  const libraryDeck = decks.find((item) => item.id === libraryDeckId) || decks[0]
  const current = drawn[resultIndex]
  const meaning = current ? meaningFor(current, deckId) : null
  const advice = phase === 'result' ? readingAdvice(drawn, deckId) : null
  const readingSource = current ? readingSourceFor(current, deckId) : null
  const target = spread
  const remainingCards = queue.filter((item) => !drawn.some((chosen) => chosen.id === item.id))
  const fanCount = remainingCards.length || deck.cards.length
  const filteredCards = libraryDeck.cards.filter((card) => `${card.name} ${card.id}`.toLowerCase().includes(libraryQuery.trim().toLowerCase()))

  useEffect(() => {
    const interval = window.setInterval(() => setWordIndex((value) => (value + 1) % rotatingWords.length), 3000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    try { localStorage.setItem('la-tarot-journal', JSON.stringify(journal)) } catch { /* Private browsing may block storage. */ }
  }, [journal])

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  function cancelPendingDraw() {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    setSelectedFan(null)
  }

  function openReading() {
    cancelPendingDraw()
    setTopic(null)
    setPhase('setup')
    setTab('reading')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openTopic(label: string) {
    setSpread(3)
    openReading()
    setTopic(label)
  }

  function beginReading() {
    cancelPendingDraw()
    setQueue(shuffled(deck.cards))
    setDrawn([])
    setActiveCard(null)
    setFlipped(false)
    setSelectedFan(null)
    setFanPosition(6)
    fanPositionRef.current = 6
    setResultIndex(0)
    setSavedId(null)
    setPhase('draw')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function drawCard(index?: number, chosenElement?: HTMLButtonElement) {
    if (activeCard || selectedFan || drawn.length >= target) return
    const resolvedIndex = wrapFanIndex(index ?? Math.round(fanPositionRef.current), remainingCards.length)
    const card = remainingCards[resolvedIndex]
    if (!card) return
    const element = chosenElement || stageRef.current?.querySelector<HTMLButtonElement>(`[data-fan-index="${resolvedIndex}"]`)
    const cardRect = element?.getBoundingClientRect()
    const stageRect = stageRef.current?.getBoundingClientRect()
    setSelectedFan({
      index: resolvedIndex,
      dx: cardRect && stageRect ? stageRect.left + stageRect.width / 2 - (cardRect.left + cardRect.width / 2) : 0,
      dy: cardRect && stageRect ? stageRect.top + stageRect.height / 2 - (cardRect.top + cardRect.height / 2) : -90,
    })
    setFlipped(false)
    timer.current = window.setTimeout(() => {
      setDrawn((prev) => [...prev, card])
      setActiveCard(card)
      setSelectedFan(null)
      timer.current = window.setTimeout(() => setFlipped(true), 260)
    }, 520)
    if (navigator.vibrate) navigator.vibrate(20)
  }

  function advanceDraw() {
    setActiveCard(null)
    setFlipped(false)
    if (drawn.length >= target) {
      setPhase('result')
      setResultIndex(0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function saveReading() {
    if (savedId || !drawn.length) return
    const reading: SavedReading = {
      id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(), deckId,
      spread, question: question.trim(), topic, cards: drawn,
    }
    setJournal((prev) => [reading, ...prev])
    setSavedId(reading.id)
  }

  function openSaved(reading: SavedReading) {
    setDeckId(reading.deckId)
    setSpread(reading.spread)
    setQuestion(reading.question)
    setTopic(reading.topic || null)
    setDrawn(reading.cards)
    setResultIndex(0)
    setSavedId(reading.id)
    setPhase('result')
    setTab('reading')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigate(next: Tab) {
    if (next !== 'reading') cancelPendingDraw()
    setTab(next)
    if (next === 'reading' && phase === 'draw') setPhase('setup')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-frame">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <div className="app-shell">
        <header className="topbar">
          <button className="brand" type="button" onClick={() => navigate('home')} aria-label="Về trang chủ">
            <span className="brand__symbol">✳</span><span>LÁ<span className="brand__dot">.</span></span>
          </button>
          <span className="topbar__caption">MỘT KHOẢNG LẶNG CHO BẠN</span>
          <button className="topbar__icon" type="button" onClick={() => navigate('journal')} aria-label="Mở nhật ký"><MoonStar size={19} strokeWidth={1.5} /></button>
        </header>

        <main key={tab} className="main-content">
          {tab === 'home' && <>
            <section className="home-hero">
              <div className="hero-orbit hero-orbit--outer" aria-hidden="true" />
              <div className="hero-orbit hero-orbit--inner" aria-hidden="true" />
              <div className="hero-spark hero-spark--a">✦</div><div className="hero-spark hero-spark--b">✧</div><div className="hero-spark hero-spark--c">✶</div>
              <p className="eyebrow hero-eyebrow"><span className="eyebrow__line" />MỘT KHOẢNH KHẮC DÀNH CHO BẠN</p>
              <h1>Nhìn vào lá bài.<br /><em key={wordIndex} className="morph-word">Để {rotatingWords[wordIndex]}</em></h1>
              <p className="home-hero__copy">Giữ một câu hỏi trong lòng.<br />Để những hình ảnh mở ra góc nhìn mới.</p>
              <div className="hero-card-stage" aria-label="Những lá bài Rider-Waite">
                <div className="hero-card hero-card--left"><CardFace card={featuredDeck.cards.find((card) => card.id === '01_Magician') || featuredDeck.cards[1]} deckId="rider-waite" /></div>
                <div className="hero-card hero-card--right"><CardFace card={featuredDeck.cards.find((card) => card.id === '16_Tower') || featuredDeck.cards[16]} deckId="rider-waite" /></div>
                <div className="hero-card hero-card--center"><CardFace card={featuredDeck.cards.find((card) => card.id === '13_Death') || featuredDeck.cards[13]} deckId="rider-waite" /></div>
                <div className="hero-card-stage__halo" aria-hidden="true" />
              </div>
              <button className="primary-button primary-button--hero" type="button" onClick={openReading}><span>Bắt đầu trải bài</span><ArrowRight size={19} /></button>
              <span className="home-hero__hint">✦ &nbsp; CHỌN MỘT CHỦ ĐỀ HOẶC BẮT ĐẦU TỰ DO &nbsp; ✦</span>
            </section>

            <section className="topic-section">
              <div className="topic-section__intro"><span className="eyebrow">LẮNG NGHE ĐIỀU BẠN QUAN TÂM</span><h2>Chọn chủ đề</h2><p>Chạm vào một chủ đề để bắt đầu trải ba lá.</p></div>
              <div className="topic-grid">{topics.map(({ label, icon: Icon, hint }, index) => <button className={`topic-tile topic-tile--${index}`} type="button" key={label} onClick={() => openTopic(label)}><span className="topic-tile__corner topic-tile__corner--tl">✦</span><span className="topic-tile__corner topic-tile__corner--br">✦</span><span className="topic-tile__sigil"><span className="topic-tile__rays" /><Icon size={48} strokeWidth={1.15} /></span><strong>{label}</strong><small>{hint}</small></button>)}</div>
            </section>

            <section className="daily-section">
              <div className="section-heading"><div><p className="eyebrow">MỘT CHÚT DỊU DÀNG</p><h2>Thông điệp hôm nay</h2></div><span className="section-heading__star">✴</span></div>
              <button className="daily-card" type="button" onClick={() => { setDeckId('soimoi'); setSpread(1); openReading() }}>
                <div className="daily-card__image"><img src={toAssetUrl('/cards/soimoi/17_Star.jpg')} alt="Lá Ngôi Sao" loading="lazy" /></div>
                <div className="daily-card__content"><span className="daily-card__tag">✦ LÁ BÀI TRUYỀN CẢM HỨNG</span><h3>Ánh sáng vẫn<br /><em>ở trong bạn.</em></h3><p>Hãy cho mình thêm một chút niềm tin vào hành trình phía trước.</p><span className="text-link">Khám phá bài của bạn <ArrowRight size={16} /></span></div>
              </button>
            </section>

            <section className="home-decks">
              <div className="section-heading"><div><p className="eyebrow">CHỌN NĂNG LƯỢNG CỦA BẠN</p><h2>Những bộ bài</h2></div><button type="button" className="tiny-link" onClick={() => navigate('library')}>Xem tất cả <ArrowRight size={15} /></button></div>
              <div className="deck-strip">
                {decks.slice(0, 5).map((item) => <button className="deck-tile" type="button" key={item.id} onClick={() => { setDeckId(item.id); openReading() }}>
                  <div className="deck-tile__image">{item.cover ? <img src={toAssetUrl(item.cover)} alt="" loading="lazy" /> : <img src={toAssetUrl(item.cards[0].image)} alt="" loading="lazy" />}<span>✦</span></div>
                  <strong>{item.name}</strong><small>{item.count} lá bài</small>
                </button>)}
              </div>
            </section>
            <p className="closing-note">Có những câu trả lời bắt đầu từ một khoảng lặng. <span>✧</span></p>
            <p className="home-credit">Ảnh Soimoi Tarot bởi <a href="https://koz.tv/" target="_blank" rel="noreferrer">Mike Koz</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>
          </>}

          {tab === 'reading' && phase === 'setup' && <section className="setup-screen screen-enter">
            <div className="page-intro"><span className="step-label">01 / 03 &nbsp;·&nbsp; CHUẨN BỊ</span><h1>{topic ? 'Chủ đề của bạn' : 'Hít thở.'}<br /><em>{topic || 'Và bắt đầu.'}</em></h1><p>Giữ trong lòng một điều bạn muốn hiểu rõ hơn. Lá bài sẽ mở ra một góc nhìn để bạn tự khám phá.</p></div>
            {topic && <button className="topic-clear" type="button" onClick={() => setTopic(null)}>✦ &nbsp; {topic} <X size={14} /></button>}
            <label className="question-label" htmlFor="question">ĐIỀU BẠN ĐANG NGHĨ ĐẾN <span>KHÔNG BẮT BUỘC</span></label>
            <div className="question-field"><Sparkles size={18} /><input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ví dụ: Mình cần chú ý điều gì?" maxLength={180} /></div>
            <div className="setup-block"><div className="block-heading"><span>01</span><h2>Chọn cách trải bài</h2></div><div className="spread-options">
              <button className={`spread-option ${spread === 1 ? 'is-selected' : ''}`} type="button" onClick={() => setSpread(1)}><span className="spread-option__visual"><i /></span><strong>Một lá</strong><small>Góc nhìn cho hiện tại</small><span className="radio-dot" /></button>
              <button className={`spread-option ${spread === 3 ? 'is-selected' : ''}`} type="button" onClick={() => setSpread(3)}><span className="spread-option__visual spread-option__visual--three"><i /><i /><i /></span><strong>Ba lá</strong><small>Một câu chuyện trọn vẹn</small><span className="radio-dot" /></button>
            </div></div>
            <div className="setup-block setup-block--deck"><div className="block-heading"><span>02</span><h2>Chọn bộ bài</h2></div><div className="deck-selector">
              {decks.map((item) => <button type="button" key={item.id} className={`deck-choice ${deckId === item.id ? 'is-selected' : ''}`} onClick={() => setDeckId(item.id)}><div className="deck-choice__art">{item.cover ? <img src={toAssetUrl(item.cover)} alt="" loading="lazy" /> : <img src={toAssetUrl(item.cards[0].image)} alt="" loading="lazy" />}</div><strong>{item.name}</strong><small>{item.count} lá</small>{deckId === item.id && <span className="deck-choice__check"><Check size={13} /></span>}</button>)}
            </div></div>
            <button className="primary-button setup-cta" type="button" onClick={beginReading}><span>Xào bài & bắt đầu</span><ArrowRight size={19} /></button><p className="under-cta">Hãy để trực giác dẫn đường <span>✦</span></p>
          </section>}

          {tab === 'reading' && phase === 'draw' && <section className="draw-screen screen-enter">
            <div className="draw-top"><button type="button" className="back-button" onClick={() => { cancelPendingDraw(); setPhase('setup') }} aria-label="Quay lại"><ArrowLeft size={20} /></button><span className="step-label">02 / 03 &nbsp;·&nbsp; RÚT BÀI</span><span className="draw-counter">{drawn.length}/{target}</span></div>
            <div className="draw-heading"><p className="eyebrow">{spread === 1 ? 'MỘT LÁ DÀNH CHO BẠN' : positions[Math.min(activeCard ? drawn.length - 1 : drawn.length, 2)].toUpperCase()}</p><h1>{activeCard ? 'Lá bài đã chọn.' : 'Chọn một lá bài'}</h1><p>{activeCard ? 'Chạm vào khoảnh khắc này và để hình ảnh kể câu chuyện của nó.' : 'Tập trung vào điều bạn đang hỏi, rồi chạm vào lá khiến bạn chú ý.'}</p></div>
            <div className="draw-stage" ref={stageRef}>
              <div className="draw-stage__orbit" aria-hidden="true" /><span className="draw-stage__star draw-stage__star--left">✦</span><span className="draw-stage__star draw-stage__star--right">✧</span>
              {activeCard ? <div className={`flip-card ${flipped ? 'is-flipped' : ''}`}><div className="flip-card__inner"><div className="flip-card__side flip-card__side--back"><CardBack deck={deck} /></div><div className="flip-card__side flip-card__side--front"><CardFace card={activeCard} deckId={deckId} /></div></div></div>
                : <FanCarousel deck={deck} count={fanCount} initialPosition={fanPositionRef.current} selectedFan={selectedFan} onPositionMove={(position) => { fanPositionRef.current = position }} onPositionSettle={setFanPosition} onSelect={drawCard} />}
            </div>
            <div className="draw-footer">
              {activeCard ? <><p className="draw-footer__label">✦ &nbsp; {meaningFor(activeCard, deckId).title}</p><button type="button" className="primary-button" onClick={advanceDraw}><span>{drawn.length >= target ? 'Xem thông điệp' : 'Rút lá tiếp theo'}</span><ArrowRight size={19} /></button></>
                : <><span className="gesture-hint">← &nbsp; XOAY VÒNG CUNG &nbsp; <b>{String(wrapFanIndex(Math.round(fanPosition), fanCount) + 1).padStart(2, '0')} / {fanCount}</b> &nbsp; →</span><div className="draw-progress">{Array.from({ length: target }, (_, index) => <span key={index} className={index < drawn.length ? 'is-done' : ''} />)}</div><button type="button" className="draw-tap" onClick={() => drawCard()}>Chạm lá bạn thích, hoặc rút lá ở giữa <ArrowRight size={16} /></button></>}
            </div>
          </section>}

          {tab === 'reading' && phase === 'result' && current && meaning && advice && <section className="result-screen screen-enter">
            <div className="result-top"><span className="step-label">03 / 03 &nbsp;·&nbsp; THÔNG ĐIỆP</span><button className="icon-button" type="button" onClick={openReading} aria-label="Trải bài mới"><RotateCcw size={18} /></button></div>
            <div className="result-intro"><span className="result-intro__mark">✦</span><p>{topic ? `CHỦ ĐỀ · ${topic.toUpperCase()}` : 'THÔNG ĐIỆP TỪ LÁ BÀI'}</p><h1>Một góc nhìn<br /><em>mới mẻ.</em></h1></div>
            <div className="reading-summary"><span>✦ &nbsp; LỜI KHUYÊN DÀNH CHO BẠN</span><p>{advice.summary}</p><a href="#loi-khuyen">Xem các gợi ý cụ thể <ArrowRight size={15} /></a></div>
            {spread === 3 && <div className="result-positions" role="tablist" aria-label="Chọn lá bài">{drawn.map((card, index) => <button role="tab" aria-selected={resultIndex === index} className={resultIndex === index ? 'is-active' : ''} type="button" key={`${card.id}-${index}`} onClick={() => setResultIndex(index)}>{index + 1}<span>{positions[index]}</span></button>)}</div>}
            <div className="result-art"><span className="result-art__halo" aria-hidden="true" /><div className="result-art__image" key={current.id}><CardFace card={current} deckId={deckId} /></div></div>
            <div className="result-card-info"><p className="eyebrow">{spread === 3 ? `LÁ ${resultIndex + 1} · ${positions[resultIndex].toUpperCase()}` : 'LÁ BÀI CỦA BẠN'}</p><h2>{meaning.title}</h2><p className="result-card-info__keywords">{meaning.keywords}</p><div className="ornament-line"><span>✧</span></div><p className="result-card-info__description">{meaning.description}</p></div>
            <section className="advice-panel" id="loi-khuyen"><p className="eyebrow">ĐIỀU BẠN CÓ THỂ LÀM</p><h2>Vậy bây giờ,<br /><em>mình nên làm gì?</em></h2><div className="advice-panel__steps">{advice.steps.map((step, index) => <div className="advice-step" key={`${step.label}-${index}`}><span className="advice-step__number">0{index + 1}</span><div><h3>{step.label}</h3><p>{step.text}</p></div></div>)}</div></section>
            <div className="reading-source"><strong>Nguồn & cách diễn giải</strong>{readingSource ? <p>Ý nghĩa tham khảo theo hệ Rider–Waite–Smith: <a href={readingSource.url} target="_blank" rel="noreferrer">{readingSource.label}</a>. Phần tiếng Việt và lời khuyên hành động do Lá biên soạn; với các bộ bài khác Rider-Waite, đây là khung tham chiếu chứ không phải ý nghĩa gốc của bộ đó.</p> : <p>Bộ bài này chưa có nguồn giải nghĩa riêng trong app. Những gợi ý trên là bài tập nhìn hình và tự chiêm nghiệm do Lá biên soạn.</p>}{deckId === 'rider-waite' && <p>Tài liệu gốc của bộ Rider-Waite: <a href="https://original.sacred-texts.com/tarot/pkt/index.htm" target="_blank" rel="noreferrer">A. E. Waite, The Pictorial Key to the Tarot</a>.</p>}</div>
            {question.trim() && <div className="question-echo"><span>CÂU HỎI CỦA BẠN</span><p>“{question.trim()}”</p></div>}
            {spread === 3 && <div className="result-controls"><button type="button" onClick={() => setResultIndex((value) => Math.max(0, value - 1))} disabled={resultIndex === 0}><ChevronLeft size={18} /> Lá trước</button><span>{resultIndex + 1} / 3</span><button type="button" onClick={() => setResultIndex((value) => Math.min(2, value + 1))} disabled={resultIndex === 2}>Lá tiếp <ChevronRight size={18} /></button></div>}
            <div className="result-actions"><button type="button" className={`primary-button ${savedId ? 'is-saved' : ''}`} onClick={saveReading} disabled={Boolean(savedId)}><span>{savedId ? 'Đã lưu vào nhật ký' : 'Lưu vào nhật ký'}</span>{savedId ? <Check size={19} /> : <Bookmark size={19} />}</button><button type="button" className="secondary-button" onClick={openReading}>Trải bài mới <ArrowRight size={17} /></button></div>
            <p className="reflection-note">Tarot là một lời gợi mở để bạn tự chiêm nghiệm, không phải một lời tiên đoán chắc chắn.</p>
          </section>}

          {tab === 'library' && <section className="library-screen screen-enter"><div className="page-intro page-intro--short"><span className="step-label">THƯ VIỆN LÁ BÀI</span><h1>Mỗi lá bài,<br /><em>một thế giới.</em></h1><p>Chạm vào một lá bài để ngắm kỹ hơn, và chọn bộ bài làm bạn rung động.</p></div><div className="library-decks" aria-label="Chọn bộ bài">{decks.map((item) => <button type="button" key={item.id} className={libraryDeckId === item.id ? 'is-active' : ''} onClick={() => { setLibraryDeckId(item.id); setLibraryLimit(24); setLibraryQuery('') }}>{item.name}</button>)}</div><div className="library-toolbar"><div><strong>{libraryDeck.name}</strong><span>{libraryDeck.count} lá bài</span></div><div className="library-search"><Search size={17} /><input aria-label="Tìm lá bài" placeholder="Tìm lá bài" value={libraryQuery} onChange={(event) => { setLibraryQuery(event.target.value); setLibraryLimit(24) }} /></div></div><div className="library-grid">{filteredCards.slice(0, libraryLimit).map((card) => <button className="library-item" key={card.id} type="button" onClick={() => setLibraryCard(card)}><img src={toAssetUrl(card.image)} alt={imageAlt(card)} loading="lazy" /><span>{meaningFor(card, libraryDeckId).title}</span></button>)}</div>{filteredCards.length === 0 && <p className="empty-note">Không tìm thấy lá bài phù hợp.</p>}{filteredCards.length > libraryLimit && <button className="load-more" type="button" onClick={() => setLibraryLimit((value) => value + 24)}>Xem thêm lá bài <ArrowRight size={17} /></button>}<p className="library-credit">Hình ảnh: {libraryDeck.name} · {libraryDeck.license}. {libraryDeck.id === 'soimoi' ? <>Tác giả <a href="https://koz.tv/" target="_blank" rel="noreferrer">Mike Koz</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.</> : 'Chi tiết nguồn trong SOURCES.md của dự án.'}</p></section>}

          {tab === 'journal' && <section className="journal-screen screen-enter"><div className="page-intro page-intro--short"><span className="step-label">NHẬT KÝ CỦA BẠN</span><h1>Những điều<br /><em>đã chạm đến.</em></h1><p>Mỗi lượt rút là một khoảnh khắc để quay lại lắng nghe chính mình.</p></div>{journal.length ? <div className="journal-list">{journal.map((entry) => { const first = entry.cards[0]; const entryDeck = decks.find((item) => item.id === entry.deckId); return <button className="journal-entry" key={entry.id} type="button" onClick={() => openSaved(entry)}><img src={toAssetUrl(first.image)} alt="" loading="lazy" /><span className="journal-entry__body"><small>{new Date(entry.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })} · {entry.spread} LÁ</small><strong>{entry.question || meaningFor(first, entry.deckId).title}</strong><span>{entryDeck?.name || 'Tarot'} <ArrowRight size={15} /></span></span></button> })}</div> : <div className="journal-empty"><span>✦</span><h2>Trang giấy còn trống.</h2><p>Trải bài đầu tiên của bạn sẽ được lưu lại ở đây, như một dấu nhỏ trên hành trình.</p><button className="primary-button" type="button" onClick={openReading}><span>Rút lá đầu tiên</span><ArrowRight size={18} /></button></div>}</section>}
        </main>

        <nav className="bottom-nav" aria-label="Điều hướng chính"><button className={tab === 'home' ? 'is-active' : ''} type="button" onClick={() => navigate('home')} aria-label="Trang chủ"><Compass size={22} strokeWidth={1.7} /><span>Khám phá</span></button><button className={tab === 'reading' ? 'is-active' : ''} type="button" onClick={() => navigate('reading')} aria-label="Trải bài"><Sparkles size={22} strokeWidth={1.7} /><span>Trải bài</span></button><button className={tab === 'library' ? 'is-active' : ''} type="button" onClick={() => navigate('library')} aria-label="Bộ bài"><Grid2X2 size={22} strokeWidth={1.7} /><span>Bộ bài</span></button><button className={tab === 'journal' ? 'is-active' : ''} type="button" onClick={() => navigate('journal')} aria-label="Nhật ký"><Heart size={22} strokeWidth={1.7} /><span>Nhật ký</span></button></nav>
      </div>

      {libraryCard && <div className="modal-backdrop" role="presentation" onClick={() => setLibraryCard(null)}><div className="card-modal" role="dialog" aria-modal="true" aria-label={`Chi tiết lá ${libraryCard.name}`} onClick={(event) => event.stopPropagation()}><button className="card-modal__close" type="button" onClick={() => setLibraryCard(null)} aria-label="Đóng"><X size={22} /></button><CardFace card={libraryCard} deckId={libraryDeckId} /><p className="eyebrow">LÁ BÀI TRONG BỘ {libraryDeck.name.toUpperCase()}</p><h2>{meaningFor(libraryCard, libraryDeckId).title}</h2><p>{meaningFor(libraryCard, libraryDeckId).description}</p><div className="card-modal__source">{readingSourceFor(libraryCard, libraryDeckId) ? <a href={readingSourceFor(libraryCard, libraryDeckId)!.url} target="_blank" rel="noreferrer">Xem nguồn tham khảo cho lá này ↗</a> : <span>Gợi ý nhìn hình do Lá biên soạn; chưa có nguồn giải nghĩa riêng.</span>}</div></div></div>}
    </div>
  )
}

export default App
