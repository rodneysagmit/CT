# ClinTrainers CT1: Site Review

An internal review site for the CT1 product page. It holds four layout options and the shared style sheet. It is not the public website.

| Page | What it is |
|---|---|
| `index.html` | Hub: links to the four options, a side-by-side comparison and review notes |
| `option-1-split.html` | Option 1: copy left, 3D model right |
| `option-2-stage.html` | Option 2: centered headline over a wide 3D stage |
| `option-3-chapters.html` | Option 3: scroll chapters beside a pinned image; procedures in tabs |
| `option-4-immersive.html` | Option 4: full-screen 3D behind the headline |
| `style-guide.html` | Typography, colors, components, 3D viewer, motion, layout, content rules |

Each option page has a small bar at the bottom for switching options. It appears once you scroll past the hero.

## Publish on GitHub Pages

1. **Create a repository** on github.com, for example `ct1-site-review`. On a free account, Pages only works on public repositories.
2. **Upload the files.** Open the new repo, choose **Add file → Upload files**, then drag in everything inside this folder: the `assets` folder, all the `.html` files, `.nojekyll`, `robots.txt` and this README. Commit.
   - Upload the folder's *contents*. `index.html` must sit at the top level of the repo, not inside a subfolder.
   - `.nojekyll` is a hidden file. If your file browser hides it, turn on hidden files, or create an empty file named `.nojekyll` in the repo afterward.
3. **Turn on Pages.** Go to **Settings → Pages → Build and deployment**. Set the source to *Deploy from a branch*, the branch to `main`, and the folder to `/ (root)`. Save.
4. **Wait a minute.** The site goes live at `https://<your-username>.github.io/ct1-site-review/`. The address also shows at the top of the Pages settings once it's live.

To update the site later, upload changed files the same way. Pages republishes on every commit.

### Using git instead

```
git init
git add .
git commit -m "CT1 site review"
git branch -M main
git remote add origin https://github.com/<your-username>/ct1-site-review.git
git push -u origin main
```

Then turn on Pages as in step 3.

## Preview on your computer

Opening the HTML files by double-clicking shows the pages, but the 3D model won't load from a local file. To preview with the 3D, run a small local server from this folder:

```
python -m http.server 8080
```

Then open http://localhost:8080.

## Good to know

- **It's public.** Anyone with the link can open a GitHub Pages site. Every page is tagged `noindex`, so search engines shouldn't list it, but that doesn't hide it from people who have the address. Share the link only with reviewers, and take it down after the decision.
- **Font license.** The Nevo font files sit in `assets/fonts/` and can be downloaded from the published site. Confirm the Nevo license allows web use before publishing, even for a review.
- **Demo buttons** open an email to inquiry@clintrainers.com, so test clicks send real email drafts.
- **This review site is not the final site.** After an option is chosen, the production version comes from `Website/ct1-site/public`. Follow the "Choosing a layout option" steps in that folder's README.

## Taking it down

Go to **Settings → Pages** and unpublish the site, or delete the repository.
