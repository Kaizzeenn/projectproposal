# Project BDAY — Marjie's birthday website

Live website: https://kaizzeenn.github.io/projectproposal/

**Edition:** November 19, 2026. Static GitHub Pages website (no build step).

## Current progress

- **Friend birthday videos:** 8 of 9 configured cards have a photo and local MP4. The remaining card is Michiko, whose photo and video are still blank.
- **Appreciation messages:** 10 of 12 filled in `content.js`. Shawn and Michiko are blank.
- **Gallery:** All 6 memory tiles have real photos or videos, including Favorite memories, Little adventures, Funny photos, Small moments, The group days and Marjie moments.
- **Marjie Files:** Three working expandable files with Hello Kitty, Panda, Potato Corner, Chichi and The Marjie Effect. The optional extra photos for Files 01 and 03 are unfilled. File 02 shows Chichi directly from the local `chichi.jpg` file.
- **Personal finale:** A local video, original couple photo, personalized letter, sunflower bouquet, digital gift, and Bible verse cards are present. The letter should receive a final personal proofreading before sharing.

## Final launch checklist

- [ ] Decide whether Michiko's birthday photo and video will be supplied. If not, consider removing the unfilled card rather than showing a "Video not submitted yet" message.
- [ ] Collect Shawn's and Michiko's appreciation messages if possible. Empty notes are hidden from the sticky-note wall.
- [ ] Proofread the personal letter and check the spelling of names and nicknames. This is a personal choice, not a technical blocker.
- [ ] Test code **1119** on a phone and desktop.
- [ ] Open all three Marjie Files and verify the bonus file unlocks.
- [ ] Test the eight published friends' videos and three gallery memory videos for both picture and sound.
- [ ] Verify all six gallery tiles show their actual pictures/posters.
- [ ] Blow out all three candles, follow the fake ending, open the hidden finale, play Aaron's video, reveal the digital gift, and open the letter.
- [ ] Check sound levels, photos, scrolling, and media playback on the **actual device and network** Marjie will use.
- [ ] Make sure GitHub Pages has deployed the final commit and refresh the site to avoid stale cached files.

## Files and editing

- `index.html`: all website sections and the finale markup.
- `styles.css`: responsive layouts, Polaroids, buttons, and animations.
- `app.js`: lock screen, carousels, video modal, candles, gallery, and reveal logic.
- `content.js`: filenames, appreciation messages, letters, and other editable copy.
- `appreciation.js`: optional browser-local editor and appreciation wall.
- All media is stored as root-level files. The entries in `content.js` use root-relative filenames.

**To update a message:** Change the quote in `content.js` and commit. The appreciation editor (`?edit=1` or Alt+Shift+E) saves to that browser only, not GitHub.

## Privacy and offline note

This is a **public** GitHub repository. The passcode and `noindex` directive do not make the personal letter, photos, videos, or digital artwork private. Anyone with the asset URL can fetch a file. Confirm that participants are comfortable with public hosting.

Videos are locally hosted on GitHub Pages instead of Google Drive, so they do not require a Drive player. **The site itself still needs internet unless all website and media files are downloaded or cached in advance.** For an offline backup, download the complete repository, not just `index.html`, and serve the folder via a small local web server.
