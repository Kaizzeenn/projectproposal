#!/usr/bin/env python3
"""Create an independent friends-only view from the Project BDAY website."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from bs4 import BeautifulSoup, Comment

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "friends"
OUT.mkdir(exist_ok=True)

source_html = (ROOT / "index.html").read_text(encoding="utf-8")
source_js = (ROOT / "app.js").read_text(encoding="utf-8")
source_content = (ROOT / "content.js").read_text(encoding="utf-8")

# HTML: remove the entire personal finale rather than simply hiding it with CSS.
soup = BeautifulSoup(source_html, "html.parser")
finale = soup.select_one("#personalReveal")
assert finale is not None, "Expected personal finale container was not found"
finale.decompose()

end = soup.select_one("#fakeEnd")
assert end is not None, "Expected birthday ending was not found"
message = end.select_one(".fake-end-inner p")
button = end.select_one("#endButton")
assert message and button
message.string = "From all your friends, with so much love. Happy birthday, Marjie! ♡"
button.string = "Back to the beginning ♡"

# Do not expose the draft editor controls to guests.
for selector in ("#appreciationEditor", "#appreciationSeed"):
    tag = soup.select_one(selector)
    if tag:
        tag.decompose()
for comment in soup.find_all(string=lambda x: isinstance(x, Comment)):
    if "editor" in str(comment).lower():
        comment.extract()

title = soup.find("title")
if title:
    title.string = "Happy Birthday, Marjie! ♡ — From Your Friends"
meta_title = soup.find("meta", attrs={"property": "og:title"})
if meta_title:
    meta_title["content"] = "Happy Birthday, Marjie! ♡ — From Your Friends"
meta_url = soup.find("meta", attrs={"property": "og:url"})
if meta_url:
    meta_url["content"] = "https://kaizzeenn.github.io/projectproposal/friends/"
desc = soup.find("meta", attrs={"name": "description"})
if desc:
    desc["content"] = "A birthday surprise for Marjie from her friends, full of messages, photos, and memories. ♡"

# New local cache identifiers so friends will not load root-site scripts.
for tag in soup.find_all(["link", "script"]):
    attr = "href" if tag.name == "link" else "src"
    url = tag.get(attr, "")
    if url.split("?")[0] in {"styles.css", "content.js", "app.js", "appreciation.js"}:
        tag[attr] = url.split("?")[0] + "?v=friends-final-20261119"

# Remove any accidental reference to the owner-only URL or personal end copy.
html = str(soup)
assert 'id="personalReveal"' not in html
assert 'id="revealCurtain"' not in html
assert 'id="personalContent"' not in html
assert 'id="aaronLetter"' not in html
assert 'id="appreciationEditor"' not in html
assert 'Bebii' not in html and 'bebiilovess' not in html
(OUT / "index.html").write_text(html, encoding="utf-8")

# Content: remove actual personal letter, couple photo, personal video, and verses.
match = re.fullmatch(r"\s*(?:/\*.*?\*/\s*)?const BDAY\s*=\s*(\{.*\});\s*", source_content, re.S)
assert match, "Expected JSON-style BDAY content was not found"
data = json.loads(match.group(1))
assert "personal" in data
del data["personal"]
# Hide the empty, not-yet-submitted Michiko video card, preserving all submitted videos.
data["birthdayMessages"] = [
    p for p in data.get("birthdayMessages", []) if p.get("video")
]
# The appreciation wall will naturally ignore unfilled notes.
friend_content = (
    "/* Friends-only birthday edition. The personal finale is not included. */\n"
    "const BDAY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
)
assert "aaron_finale.mp4" not in friend_content
assert '"personal"' not in friend_content
assert "HAPPYYY BADUDIIII" not in friend_content
(OUT / "content.js").write_text(friend_content, encoding="utf-8")

# App: physically discard the owner's private finale behavior.
start = source_js.find("  if(isFriends){")
stop = source_js.find("  function confetti(count){", start)
assert start >= 0 and stop > start, "Could not safely locate finale handlers"
friend_js = (
    source_js[:start]
    + "  // The friends' version ends here; the private finale is not part of this bundle.\n"
    + "  $('#endButton')?.addEventListener('click',()=>goTo('welcome'));\n\n"
    + source_js[stop:]
)
friend_js = friend_js.replace(
    "const isFriends = !!window.BDAY_FRIENDS_ONLY;",
    "const isFriends = true;"
)
# The personal section scroll observer is no longer relevant.
friend_js = re.sub(
    r"\n  document\.addEventListener\('scroll',\(\)=>\{.*?\n  \},\{passive:true\}\);",
    "",
    friend_js, flags=re.S
)
assert "BDAY.personal" not in friend_js
assert "bebiilovess" not in friend_js
assert "aaron_finale.mp4" not in friend_js
assert "personalReveal" not in friend_js
(OUT / "app.js").write_text(friend_js, encoding="utf-8")

# Appreciation wall: render only published notes, without the editing/export panel.
friend_appreciation = r"""(() => {
  'use strict';
  const wall = document.getElementById('appreciationWall');
  if (!wall || typeof BDAY === 'undefined') return;
  const filled = (BDAY.appreciationNotes || []).filter(x => x && typeof x.quote === 'string' && x.quote.trim());
  const doodles = ['✿','♡','✦','☁','❀','⟡'];
  const pins = ['✿','♡','✦','⋆','☁','❀'];
  filled.forEach((entry, i) => {
    const article = document.createElement('article');
    article.className = 'ap-note';
    article.style.animationDelay = (i * 85) + 'ms';
    const doodle = document.createElement('span');
    doodle.className = 'ap-note-doodle';
    doodle.setAttribute('aria-hidden', 'true');
    doodle.textContent = doodles[i % doodles.length];
    const quote = document.createElement('blockquote');
    quote.className = 'ap-note-quote';
    quote.textContent = '“' + entry.quote.trim() + '”';
    const signature = document.createElement('div');
    signature.className = 'ap-note-signature';
    const heart = document.createElement('span');
    heart.className = 'ap-note-heart';
    heart.textContent = '♡';
    const name = document.createElement('span');
    name.textContent = '— ' + entry.name;
    signature.append(heart, name);
    const pin = document.createElement('span');
    pin.className = 'ap-note-pin';
    pin.setAttribute('aria-hidden', 'true');
    pin.textContent = pins[(i+2) % pins.length];
    article.append(doodle, quote, signature, pin);
    wall.append(article);
  });
})();"""
(OUT / "appreciation.js").write_text(friend_appreciation + "\n", encoding="utf-8")
shutil.copy2(ROOT / "styles.css", OUT / "styles.css")

# Collect only media referenced by the friends' page and the sanitized config.
allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".mp4"}
assets = set()
for group in ("innerCircle", "birthdayMessages", "memories"):
    for item in data[group]:
        for key in ("photo", "video"):
            name = item.get(key, "")
            if name:
                assets.add(name)
for tag in soup.find_all(["img", "video", "source"]):
    src = tag.get("src", "").split("?")[0]
    if src and Path(src).suffix.lower() in allowed_exts:
        assets.add(src)
# The optional third-file photo is not set, but extra public favorite-photo references in
# the HTML must be present. No private artwork, video, or couple photo gets copied.
for item in assets:
    assert Path(item).name == item and ".." not in item, "Unsafe media filename: " + item
    original = ROOT / item
    assert original.exists(), "Missing media: " + item
    shutil.copy2(original, OUT / item)

private_names = {"aaron_finale.mp4", "aaron_marjie_finale.jpg", "digital_gift_art.jpg"}
assert not (assets & private_names), "Private media appeared in friends' manifest"
assert all(not (OUT / x).exists() for x in private_names), "Private file exists in friends folder"

readme = (
    "# Friends-only version of Marjie's birthday website\n\n"
    "This version keeps all submitted greetings, Marjie Files, appreciation notes, "
    "gallery, and the cake ending. It does **not** include Aaron's personal "
    "finale, video, couple photo, letter, digital gift, or personal verses.\n\n"
    "Website: https://kaizzeenn.github.io/projectproposal/friends/\n\n"
    "The full original is hosted in the same public GitHub repository, so this "
    "friends-only page is a clean presentation copy, not a privacy boundary.\n"
)
(OUT / "README.md").write_text(readme, encoding="utf-8")

print(f"Created friends-only version with {len(assets)} media files")
print(f"Video cards: {len(data['innerCircle']) + len(data['birthdayMessages'])}")
print(f"Gallery memories: {len(data['memories'])}")
print(f"Appreciation notes: {sum(bool(x.get('quote', '').strip()) for x in data['appreciationNotes'])}")
print(f"Folder: {OUT}")
