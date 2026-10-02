# Lá — mobile Tarot app

From the repository root, run `python3 scripts/prepare_web_assets.py` after changing the source decks. This generates optimized JPEGs in `web/public/cards/` and `web/src/data/decks.json`. The generated card files are included so the web app can run without Python after setup.

```bash
cd web
npm install
npm run dev
npm run build
```

The app works entirely in the browser. It uses local storage for the reading journal, and no personal data is sent to a server. The card guidance is for reflection. The Soimoi imagery is by Mike Koz under CC BY 4.0; see the root `SOURCES.md` and `tarot/soimoi/LICENSE` for deck attribution.

## Interpretation sources

- The named Major Arcana and all 56 Minor Arcana have card-specific Vietnamese paraphrases guided by modern Rider–Waite–Smith meanings in [Labyrinthos's 78-card guide](https://labyrinthos.co/blogs/tarot-card-meanings-list). Every supported card links to its own Labyrinthos page in the app.
- [A. E. Waite's *The Pictorial Key to the Tarot*](https://original.sacred-texts.com/tarot/pkt/index.htm) is a historical reference for the Rider-Waite deck. The app's Vietnamese descriptions are not translations of Waite's text.
- The practical steps and three-card synthesis are written for Lá, based on those broad themes. They are prompts for reflection, not established meanings from either source.
- Soimoi, Marseille, Viéville, Visconti-Sforza and Oswald Wirth use that RWS framework as a reference where card names can be matched. Sola Busca, Etteilla and Tarot Nouveau currently show image-based reflection prompts because this app has no deck-specific interpretation source for them.
