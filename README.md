# Project BDAY — Full Birthday Website (GitHub Pages)

This is the **complete** November 18 master of Marjie's birthday website, including the **friends' videos and photos** and the **personal hidden finale** with the sunflower bouquet, special digital artwork reveal, Bible verse cards, and personal letter section.

**IMPORTANT: Uploading to a PUBLIC GitHub repository publishes all files, including the personal artwork, videos, text, and the entire finale.** The `1119` code delays the surprise on screen but is **not security**: anyone can inspect the source or access media URLs. The `noindex` meta only asks search engines not to index this site; it does not make it private. Make sure friends are comfortable with public hosting of their media.

## Upload to GitHub Pages

1. Extract `Project_BDAY_GitHub_Full_Finale_Nov18.zip`.
2. Go to your repository on GitHub. Delete/replace older website files as needed.
3. Upload the **contents** of the extracted folder, not the outer folder itself. `index.html` must sit at the repository root next to `styles.css`, `app.js`, `content.js`, and `appreciation.js`.
4. Preserve all directories and paths under `assets/photos/` and `assets/videos/`.
5. Commit. Under **Settings → Pages → Build and deployment**, select **Deploy from a branch**, branch `main`, folder `/ (root)`, and Save.
6. Visit the Pages link after deployment. Enter `1119`. Test the video cards, candles, **That’s everything?** button, sunflower animation, and the digital-art **Open your digital gift** button.

## Files

- `index.html`: complete birthday page with the private finale **included**.
- `styles.css`: styles for desktop, mobile, scrapbook notes, bouquet, and art reveal.
- `app.js`: passcode, carousels, cake, video playback, hidden finale, art reveal.
- `content.js`: contributor names, assets, quote entries, memories, **Aaron's personal letter and video path**.
- `appreciation.js`: owner-only editing of sticky-note quotes (Alt + Shift + E). This is not authenticated; don't rely on it for private submissions on a public website.
- `assets/photos`: current real display pictures including Freyja + Paolo, Liam, Maggie, Yeisha's video frame, Shawn + Victor, and the digital artwork.
- `assets/videos`: four submitted birthday videos.
- `.nojekyll`: GitHub Pages static-file compatibility.

## Already present

- Freyja + Paolo — shared photo and video
- Liam — photo and video
- Maggie — photo, video, and exact appreciation note
- Yeisha — video and thumbnail extracted from it
- Shawn + Victor — photo; video not yet submitted
- Paolo — exact appreciation quote, attributed separately from the Freyja + Paolo shared video
- Chloe + Precious — combined card; submissions pending
- All existing Marjie Files, appreciation sticky notes, cake, **sunflower bouquet**, digital-art gift, letter section and finale ending

## Still to complete (do not present placeholders as finished)

1. **Your personal video:** Copy your MP4 to `assets/videos/aaron_finale.mp4`; in `content.js`, set `BDAY.personal.video` to `"assets/videos/aaron_finale.mp4"`.
2. **Your personal letter:** Replace `BDAY.personal.letter` in `content.js`. The current paragraph is a *draft*, not your final personal words.
3. **Missing greetings/photos:** Copy each actual submitted video/photo into `assets/` and set the relevant `BDAY.innerCircle` or `BDAY.birthdayMessages` `video` and `photo` paths in `content.js`. Keep pairs combined unless you choose otherwise.
4. **Marjie Files / Memories:** Several sections still have intentional photo/story placeholders; add your own real stories/photos.
5. Appreciation answers can be entered with **Alt + Shift + E** while previewing, but for reliable GitHub deployment edit `BDAY.appreciationNotes` in `content.js` and commit the change. Browser-local changes do not automatically publish to GitHub. Do not create separate public uploads of private draft notes unless intended.

## Testing locally

Open `index.html` from the extracted folder. For more reliable testing, run `python -m http.server 8000` in this folder and open `http://localhost:8000` in a browser. No build tools or package manager needed.

## Updating your site later

Replace the needed asset(s) and edit `content.js`. Commit changed files to GitHub. The published page will redeploy automatically. Keep the folder structure intact; do not upload the ZIP itself as a website file.
