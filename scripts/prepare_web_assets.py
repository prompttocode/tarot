#!/usr/bin/env python3
"""Create a compact, deployable card set and manifest for the mobile web app."""

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
OUTPUT = WEB / "public" / "cards"
MANIFEST = WEB / "src" / "data" / "decks.json"
MAX_WIDTH = 440


def label(stem: str) -> str:
    if stem.isdigit():
        return f"Lá số {int(stem)}"
    if "_" in stem:
        first, rest = stem.split("_", 1)
        if first.isdigit():
            return rest.replace("_", " ")
    for suit in ("Wands", "Cups", "Swords", "Pents", "Hearts", "Diamonds", "Clubs", "Spades"):
        if stem.startswith(suit) and stem[len(suit):].isdigit():
            return f"{suit} {int(stem[len(suit):])}"
    return stem.replace("_", " ")


def optimize(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if image.width > MAX_WIDTH:
            image.thumbnail((MAX_WIDTH, 2000), Image.Resampling.LANCZOS)
        image.save(target, "JPEG", quality=78, optimize=True, progressive=True)


def main() -> None:
    config = json.loads((ROOT / "decks_config.json").read_text(encoding="utf-8"))["decks"]
    decks = []
    for deck_id, info in config.items():
        folder = ROOT / info["resized_dirs"]["720px"]
        files = sorted(p for p in folder.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
        cards = []
        cover = None
        for source in files:
            target_name = f"{source.stem}.jpg"
            optimize(source, OUTPUT / deck_id / target_name)
            url = f"/cards/{deck_id}/{target_name}"
            if source.stem.lower().startswith("cover"):
                if cover is None:
                    cover = url
                continue
            cards.append({"id": source.stem, "name": label(source.stem), "image": url})
        decks.append({
            "id": deck_id,
            "name": info["name"],
            "count": len(cards),
            "license": info.get("license", ""),
            "cover": cover,
            "cards": cards,
        })
        print(f"{deck_id}: {len(cards)} cards")
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(decks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
