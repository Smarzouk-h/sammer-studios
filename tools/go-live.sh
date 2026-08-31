#!/usr/bin/env bash
# Switch the site over to sammerstudios.com, once the DNS records exist.
#
#   ./tools/go-live.sh
#
# Waits for the domain to point at GitHub, rewrites every canonical, og:url,
# og:image, the sitemap and robots.txt, writes the CNAME file, pushes, tells
# GitHub Pages about the domain, and turns on HTTPS when the certificate is
# ready.
#
# It deliberately refuses to run before DNS is live. Publishing the new
# canonical tags early would point search engines at a domain that does not
# resolve, and setting the custom domain early makes the github.io address
# redirect to a dead host, taking the site down until DNS catches up.

set -euo pipefail

DOMAIN="${1:-sammerstudios.com}"
REPO="${REPO_NAME:-sammer-studios}"

cd "$(dirname "$0")/.."

echo "Checking DNS for $DOMAIN ..."

# A single lookup is not evidence: public resolvers drop or rate-limit queries
# often enough that one empty answer means nothing. Ask a few, a few times.
lookup_a() {
  for server in 1.1.1.1 8.8.8.8 9.9.9.9 ""; do
    out=$(dig +short +time=3 +tries=1 A "$DOMAIN" ${server:+@$server} 2>/dev/null | tr '\n' ' ')
    if echo "$out" | grep -q "185.199"; then echo "$out"; return 0; fi
  done
  return 1
}

A=""
for _ in 1 2 3 4 5; do
  if A=$(lookup_a); then break; fi
  sleep 3
done

if ! echo "${A:-}" | grep -q "185.199"; then
  cat >&2 <<EOF

$DOMAIN does not point at GitHub yet.

Currently: ${A:-no A records at all}

In the Cloudflare dashboard, under $DOMAIN > DNS > Records, add:

  A      @     185.199.108.153     DNS only (grey cloud)
  A      @     185.199.109.153     DNS only
  A      @     185.199.110.153     DNS only
  A      @     185.199.111.153     DNS only
  CNAME  www   smarzouk-h.github.io  DNS only

The grey cloud matters. With Cloudflare's proxy on, GitHub cannot issue the
certificate and you get a redirect loop. Turn it on later if you want.

Then run this again.
EOF
  exit 1
fi
echo "  points at GitHub: $A"

USER=$(gh api user --jq .login)

echo "Rewriting URLs ..."
./tools/set-domain.sh "https://$DOMAIN" >/dev/null

echo "Publishing ..."
./tools/publish.sh >/dev/null 2>&1 || {
  git add -A
  git commit -q -m "Move to $DOMAIN" || true
  git push -q origin main
}

echo "Telling GitHub Pages about the domain ..."
gh api -X PUT "repos/$USER/$REPO/pages" -f "cname=$DOMAIN" >/dev/null 2>&1 \
  || echo "  (could not set it over the API; set it under Settings > Pages)"

echo "Waiting for the certificate, this can take a few minutes ..."
for _ in $(seq 1 40); do
  state=$(gh api "repos/$USER/$REPO/pages" --jq '.https_certificate.state // "none"' 2>/dev/null || echo none)
  [ "$state" = "approved" ] && break
  sleep 20
done

gh api -X PUT "repos/$USER/$REPO/pages" -F "https_enforced=true" >/dev/null 2>&1 \
  || echo "  (tick Enforce HTTPS under Settings > Pages once the certificate is ready)"

echo ""
echo "Done. Check:"
echo "    https://$DOMAIN"
echo "    https://www.$DOMAIN"
