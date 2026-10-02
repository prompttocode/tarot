import { majorIndexFor, type Card } from './meanings'

const base = 'https://labyrinthos.co/blogs/tarot-card-meanings-list/'
const majorSlugs = [
  'the-fool', 'the-magician', 'the-high-priestess', 'the-empress', 'the-emperor',
  'the-hierophant', 'the-lovers', 'the-chariot', 'strength', 'the-hermit',
  'the-wheel-of-fortune', 'justice', 'the-hanged-man', 'death', 'temperance',
  'the-devil', 'the-tower', 'the-star', 'the-moon', 'the-sun', 'judgement', 'the-world',
]
const rankSlugs = [
  '', 'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'page', 'knight', 'queen', 'king',
]
const traditionalDecks = new Set(['soimoi', 'rider-waite', 'marseille', 'vieville', 'visconti-sforza', 'oswald-wirth'])

export function readingSourceFor(card: Card, deckId: string): { url: string; label: string } | null {
  if (!traditionalDecks.has(deckId)) return null
  const major = majorIndexFor(card, deckId)
  if (major !== null) {
    return { url: `${base}${majorSlugs[major]}-meaning-major-arcana-tarot-card-meanings`, label: 'Labyrinthos · ý nghĩa lá này' }
  }
  const minor = card.id.match(/^(Wands|Cups|Swords|Pents)(\d{2})$/)
  if (!minor) return null
  const rank = rankSlugs[Number(minor[2])]
  const suit = minor[1] === 'Pents' ? 'pentacles' : minor[1].toLowerCase()
  if (!rank) return null
  return { url: `${base}${rank}-of-${suit}-meaning-tarot-card-meanings`, label: 'Labyrinthos · ý nghĩa lá này' }
}
