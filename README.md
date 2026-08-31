# Sammer Studios

A photography site for Sammer Marzouk: portfolio, booking, and a print shop
you fulfil through Google Photos.

Plain HTML, CSS, and JavaScript. No build step, no framework, no npm. Open
`index.html` in a browser and it works. That is deliberate: nothing here will rot
or need updating in six months.

```
index.html         Home
portfolio.html     98 photographs, grouped and filterable, with a lightbox
prints.html        The shop: pick a photo, pick a size, send the order
book.html          Session packages, a request form, and a calendar slot
about.html         Bio and contact

assets/js/site-config.js    ← the only file you normally need to edit
assets/css/site.css         Styling
data/photos.js              Generated. Do not edit by hand.
photos/                     Web-sized images (thumb, full, hero)
video/                      Nine silent ambient loops and their poster frames
data/instagram.js           Synced Instagram posts. Empty by default.
tools/                      Scripts to regenerate everything
```

---

## Two things to set up before you tell anyone about it

Both live at the top of `assets/js/site-config.js`. Until you do them the site
still works. It just falls back to opening the visitor's email app instead of
sending you a message directly, which loses a lot of people.

### 1. A form backend, five minutes

Booking requests and print orders need somewhere to go.

1. Sign up at [formspree.io](https://formspree.io) (free tier is fine).
2. Create a form, copy its endpoint URL.
3. Paste it in:

```js
formEndpoint: "https://formspree.io/f/xxxxxxxx",
```

Send yourself a test order afterwards.

### 2. A calendar, optional but worth it

Set `schedulingEmbedUrl` and a "Pick a time" calendar appears on the booking
page. Leave it empty and visitors just use the request form, which is a
perfectly good way to start.

Your Northwestern Google account already does this for free:
**Calendar → Create → Appointment schedule → Share → Embed**. Calendly and
Cal.com links work too.

---

## How print orders actually work

Nothing is automated, and nothing charges a card. The flow is:

1. Someone picks a photograph and a size and sends the order with their address.
2. It lands in your inbox with the photo's title and filename, the size, the
   quantity, and the total.
3. You order that print from Google Photos and ship it to them.
4. You invoice them for the site's price. The difference is yours.

The order email names the photo twice, the title and the `slug`, so you can
find the original in your library without guessing.

### What you keep

Your costs and margins are in `tools/costs.local.md`. That file is gitignored
and never published, because `site-config.js` is downloaded by every visitor
and anything in it is public. Supplier costs do not belong on a public site.

Check those numbers against Google Photos before you rely on them, and order
one 8x10 of your own work first. You will learn the real cost, the real
turnaround, and what the paper actually looks like.

### Taking the money

As soon as an order goes through, the customer sees two buttons with the exact
total already filled in:

    Venmo    venmo.com/u/Sammer-Marzouk
    PayPal   paypal.me/SammerMarzouk/54.00

Both handles live under `payment` in the config. Set either to "" to hide that
option. Nothing is charged automatically: they pay when they choose, which is
why the copy says you confirm the order first. Check the money landed before
you send anything to print.

---

## Testimonials

Three are live on the booking page, under the packages: the ERAS student, the
engaged couple, and the physician from the conference. I fixed typos and split
run-on sentences, nothing else. The claims and the phrasing are theirs.

They are credited by role at the moment ("Medical student", "Engaged couple",
"Physician"). A first name is more convincing than a job title, so if any of
the three are happy to be named, put it in `who` in the config. An entry with
an empty `quote` is skipped, so you can add a fourth by pasting one in.

## The old cameras

You still shoot a 2006 Canon Rebel XTi and you have a standard-definition Sony
Handycam, so both now earn their place rather than sitting in a drawer:

- **A "Vintage & Camcorder" package**, from $150, that can be added to any
  session or booked alone. Retro camcorder footage is genuinely in demand for
  weddings and parties right now, and you own the gear for it.
- **An "Old cameras" filter** on the portfolio, under the collection buttons.
  It cuts across the collections rather than replacing them: a photograph stays
  in Product or Travel and can also be seen with the rest of the Rebel work.
- The camera is named in the lightbox caption, but only for the old bodies.
  Naming the A7 IV on every frame would be noise; "Canon Rebel XTi, 2006" is
  the point.

That filter is generated from the EXIF in your originals, so it stays correct
on its own. Nine photographs qualify today, including all three Dar Baklava
frames and Ameyoko After Dark. That is the strongest argument for the package:
your paid product commission was shot on a nineteen-year-old entry-level body.

Three Handycam clips lead the motion strip on the home page: friends round a
restaurant table under string lights, the moon coming up through cloud over the
lake, and boats moored off the lakefront at dusk. All three are kept at 854 by
480 and lightly compressed, because the softness is the product and sharpening
it would defeat the point. They carry a small "Sony Handycam" label so the look
reads as deliberate rather than as a broken file.

The table clip arrived anamorphic, 720 by 480 stored with a 32:27 pixel ratio,
which plays squashed unless it is corrected. It is unsquashed to square pixels
so the proportions match the other two.

Your takes ran 25, 35 and 48 seconds; I cut the strongest twelve seconds out of
each. One of them has you on camera near the end, which I left out: say the
word if you want it on the About page, where it would sit better than in a row
of landscapes.

**Worth checking before you publish.** The table clip shows several
identifiable faces. They are presumably friends rather than clients who signed
anything, and this is a commercial site. Make sure they are happy to be on it,
the same as for the headshots and the banquet photograph.

## Pulling in Instagram

There is a "Latest posts" strip on the home page. It stays hidden until
`data/instagram.js` has something in it, so the site is fine either way.

Instagram will not let a website read a public account without credentials, and
Meta retired the simple API that used to allow it. There are two honest routes.

**The free one, about twenty minutes of admin.** Switch @sammerstudios to a
Professional account, link it to a Facebook Page, create an app at
developers.facebook.com, and generate a long-lived token. Then:

```bash
export IG_TOKEN="your-token"
python3 tools/sync-instagram.py
```

That writes `data/instagram.js` and prints a refreshed token. The token expires
every 60 days, so re-run it roughly every other month, or put it on a schedule
with a GitHub Action if you host the site from a repo.

**The lazy one, a few dollars a month.** A hosted widget such as Behold.so,
LightWidget, or EmbedSocial handles the whole token dance and gives you one
`<script>` tag to paste into `index.html` where the strip currently sits. If
you would rather never think about tokens, use this.

Either way, synced posts stay in their own strip and are never sold as prints.
Instagram re-compresses everything to around 1080px, which is fine for a feed
and far too small for the 2400px files the print shop uses. To put a photograph
in the portfolio properly, add the original through `tools/curation.py`.

## Editing the site

Almost everything is in `assets/js/site-config.js`: your email, session
packages and prices, print sizes and prices, shipping, the About text, and
both Instagram handles. Change the text between the quotes and reload.

After editing, hard-refresh (Cmd-Shift-R). Browsers hold on to the old config
file otherwise.

### Photographs of you are kept out of the portfolio

`records`, `under-the-lanterns`, `looking-out-at-petra`, `me-with-camera` and
`me-at-the-bridge` are in a hidden collection called `me`. You are in the frame
in all of them, so someone else took them, and a portfolio should only show
work you made. They are used as the About and booking-page portraits instead,
a different one in each place, set under `portraitsOfMe` in the config. They
never appear in the portfolio or the print shop.

If any of those are actually yours, move them back to a real collection in
`tools/curation.py` and rebuild.

### Adding or removing photographs

Photo captions and groupings live in `tools/curation.py`. Each line is:

```python
(176, "lakefront-sunstar", "Last Light on the Lakefront", "chicago", "Chicago, IL", 3),
#  ↑         ↑                        ↑                       ↑           ↑         ↑
# source   filename                 title                 collection  location   featured
```

`featured` runs 0–3. Anything above 0 is treated as strong work and sorts to
the front of its collection; 3 is reserved for the few you would show first.

Then regenerate:

```bash
./tools/unpack-sources.sh ~/Downloads/_photo-staging
python3 tools/build_images.py --source ~/Downloads/_photo-staging
```

That takes about three minutes and rewrites `photos/` and `data/`. It needs
ImageMagick (`brew install imagemagick`) and `pip3 install pillow pillow-heif`.

The source number on each line refers to `tools/_source_index.txt`, which maps
numbers to original filenames. To add a photograph that is not in that list,
add it to the index file with the next free number, then add a curation line.

**Every generated image is stripped of metadata.** This matters: 39 of your
originals carry GPS coordinates, and those would otherwise tell strangers
where you live. If you ever hand-copy an image into `photos/`, run
`magick in.jpg -strip out.jpg` first.

---

## What is still missing

Sections are built and waiting; they need files.

1. **An engagement session.** Six to eight from one shoot, so it reads as a
   session rather than one lucky frame. This is a listed package with no
   pictures behind it.
2. **A graduation session.** Four or five.
3. **Calligraphy, properly photographed.** The three on the site are one dark
   phone shot and two frames pulled from your video. Lay the finished pieces
   flat near a window, shoot straight down, no flash. Six would carry the
   section on their own, and they would be sellable as prints, which the
   current ones are not really.
4. **More ERAS headshots.** Two is enough to prove it; five or six would let
   the collection stand as a portfolio in its own right.
5. **Handycam footage at a paid job.** The table clip is friends rather than
   a client. One reception or party you were actually hired for would let the
   vintage package show real work instead of a night out.

Covered now: ERAS headshots, the American Muslim Physician Association banquet,
and Northwestern Medicine.

## Putting it online

The site is static, so anything that serves files will host it. Two routes,
both free. Pick one.

### GitHub Pages, using the account you already have

Your machine is already set up as **Smarzouk-h**, so this is the shortest path.
The GitHub CLI is installed but not logged in, and logging in is something only
you can do:

```bash
gh auth login
```

Choose GitHub.com, then HTTPS, then log in with a web browser. Once that is
done:

```bash
./tools/publish.sh
```

That creates the repository, pushes everything, switches Pages on, and prints
your URL. It will be:

    https://smarzouk-h.github.io/sammer-studios/

The first push takes a few minutes because the photographs are large. Every
later update is the same one command: it commits what changed and pushes.

### Netlify Drop, if you would rather not touch a terminal

Open [app.netlify.com/drop](https://app.netlify.com/drop) and drag the whole
`sammer-studios` folder onto the page. It is live in about thirty seconds on a
random address. You can claim it with a free account afterwards to keep the URL
and to attach a real domain. To update the site you drag the folder again.

### Your own domain

`sammerstudios.com` and similar run about $12 a year at Namecheap, Cloudflare,
or Porkbun. Both hosts above walk you through pointing it at the site.

Once you have the real domain, search the five HTML files for
`https://sammerstudios.com` and replace it. It appears in the `canonical` and
Open Graph tags, which control the preview card when someone shares a link.
Swap `assets/img/og.jpg` too if you want a different preview image.

### Previewing locally

Double-clicking `index.html` works. For something closer to the real thing:

```bash
cd ~/Downloads/Personal\ Folder/sammer-studios && python3 -m http.server 4173
```

Then open `http://localhost:4173`.

### About offloading the files

Publishing puts the web-sized copies online: 2400px on the long edge, which is
right for a screen and deliberately not enough to print large from. Keep your
originals. This is a portfolio, not a backup, and the site holds a curated
selection rather than everything you shot.

## Notes

The whole thing is about 140 MB, nearly all of it photographs, which still sits
inside every free hosting tier. Images are capped at 2400px on the long edge.
That is up from 2000px, because on a retina laptop the old cap was being
upscaled in the lightbox and looked soft. 2400px is sharp on screen and still
awkward to print large from, which matters given you sell prints.

The thirteen video clips are muted, looping, and only load when they scroll
into view. They are skipped entirely for anyone on a metered connection or with
reduced-motion turned on.

There are still no testimonials and no client logos. The Experience strip on
the home and About pages lists real engagements in plain text instead, which is
honest and needs nobody's brand assets. Once you have written testimonials they
belong on the booking page, just under the packages.

The Experience strip names Northwestern Medicine, the American Muslim
Physician Association, and Dar Baklava. Make sure you are comfortable with each
of those being public, and that the people in the headshots and the banquet
photograph are happy to be on a public site.

Treat the prices as a starting point, which is now what the site says out loud:
the pricing panel on the booking page states plainly that you negotiate on
specifics. Watch what people agree to without hesitating, then raise them.

The About page says you shoot a Sony A7 IV with the 28–70mm kit lens, because
that is what every Sony frame in the archive was shot on. If you get faster
glass, update `about.gear` in the config.

---

## Credits

Photographs by Sammer Marzouk. Type is Fraunces and Inter, served by Google
Fonts. Everything else is hand-written HTML, CSS, and JavaScript.
