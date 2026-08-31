#!/usr/bin/env bash
# Point the site at a domain.
#
#   ./tools/set-domain.sh https://sammerstudios.com
#   ./tools/set-domain.sh https://smarzouk-h.github.io/sammer-studios
#
# Rewrites the canonical and og:url tags on every page, rewrites sitemap.xml
# and robots.txt, and writes or removes the CNAME file GitHub Pages needs for
# a custom domain. Run ./tools/publish.sh afterwards.
#
# Getting these right matters: a canonical tag naming a domain you do not own
# tells search engines the real copy of the site is somewhere that does not
# exist, and they will act on it.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <site url>" >&2
  echo "  e.g. $0 https://sammerstudios.com" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

RAW="${1%/}"                       # strip any trailing slash
HOST="${RAW#https://}"; HOST="${HOST#http://}"
BASE="$RAW"

PAGES=(index.html portfolio.html prints.html book.html about.html)

for f in "${PAGES[@]}"; do
  if [ "$f" = "index.html" ]; then page=""; else page="$f"; fi

  # canonical
  python3 - "$f" "$BASE/$page" <<'PY'
import re, sys
path, url = sys.argv[1], sys.argv[2]
s = open(path).read()
s = re.sub(r'<link rel="canonical" href="[^"]*">',
           f'<link rel="canonical" href="{url}">', s)
if '<link rel="canonical"' not in s:
    s = s.replace('</head>', f'<link rel="canonical" href="{url}">\n</head>')

# og:url, added next to the other Open Graph tags if missing
if 'property="og:url"' in s:
    s = re.sub(r'<meta property="og:url" content="[^"]*">',
               f'<meta property="og:url" content="{url}">', s)
else:
    s = s.replace('<meta property="og:type"',
                  f'<meta property="og:url" content="{url}">\n<meta property="og:type"', 1)

# og:image needs to be absolute for previews to render
s = re.sub(r'<meta property="og:image" content="[^"]*">',
           f'<meta property="og:image" content="{url.rsplit("/",1)[0] if url.endswith(".html") else url.rstrip("/")}/assets/img/og.jpg">', s)
open(path, "w").write(s)
PY
done

# sitemap
python3 - "$BASE" <<'PY'
import sys
base = sys.argv[1].rstrip("/")
pages = [("", "1.0"), ("portfolio.html", "0.9"), ("prints.html", "0.9"),
         ("book.html", "0.8"), ("about.html", "0.7")]
out = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for p, pri in pages:
    out.append(f"  <url>\n    <loc>{base}/{p}</loc>\n    <priority>{pri}</priority>\n  </url>")
out.append("</urlset>")
open("sitemap.xml", "w").write("\n".join(out) + "\n")
PY

printf 'User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' "$BASE" > robots.txt

# CNAME tells GitHub Pages to serve a custom domain. Only for a real domain,
# never for the github.io address, where it would break the site.
case "$HOST" in
  *.github.io|*.github.io/*)
    rm -f CNAME
    echo "Using the GitHub Pages address, so no CNAME file."
    ;;
  *)
    echo "${HOST%%/*}" > CNAME
    echo "Wrote CNAME for ${HOST%%/*}"
    ;;
esac

echo "Site URL set to $BASE"
echo "Now run ./tools/publish.sh"
