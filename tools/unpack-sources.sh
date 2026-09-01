#!/usr/bin/env bash
# Recreate the folder of original photographs that build_images.py reads from.
#
# The site ships with the finished web-sized images, so you only need this if
# you want to re-run the build: to add photographs, change the crop sizes, or
# regenerate everything from the originals.
#
#   ./tools/unpack-sources.sh ~/Downloads/_photo-staging
#   python3 tools/build_images.py --source ~/Downloads/_photo-staging

set -euo pipefail

DEST="${1:-$HOME/Downloads/_photo-staging}"
ZIP_A="$HOME/Downloads/Professional Pictures-1-001.zip"
ZIP_B="$HOME/Downloads/Photos-1-001.zip"

for z in "$ZIP_A" "$ZIP_B"; do
  if [ ! -f "$z" ]; then
    echo "Can't find $z" >&2
    echo "Point this script at wherever you keep those two zips, or unpack them by hand:" >&2
    echo "  $DEST/Professional Pictures/...   (from Professional Pictures-1-001.zip)" >&2
    echo "  $DEST/loose/...                   (from Photos-1-001.zip)" >&2
    exit 1
  fi
done

mkdir -p "$DEST/loose" "$DEST/new"
echo "Unpacking into $DEST ..."
unzip -q -o "$ZIP_A" -d "$DEST"
unzip -q -o "$ZIP_B" -d "$DEST/loose"

# Later batches, if you still have them. Missing ones are skipped quietly.
for i in 1 2 3; do
  z="$HOME/Downloads/Photos-1-001 ($i).zip"
  [ -f "$z" ] && unzip -q -o "$z" -d "$DEST/new/b$i"
done
# Batch 4 is a mix: three loose files plus the contents of zips 4 and 5.
mkdir -p "$DEST/new/b4"
for f in DSC01648.jpg DSC01779.jpg DSC01972.jpg; do
  [ -f "$HOME/Downloads/$f" ] && cp "$HOME/Downloads/$f" "$DEST/new/b4/"
done
for i in 4 5; do
  z="$HOME/Downloads/Photos-1-001 ($i).zip"
  [ -f "$z" ] && unzip -q -o -j "$z" -x "*.MP4" "*.MOV" -d "$DEST/new/b4"
done
# Loose portrait and event frames.
mkdir -p "$DEST/new/b5"
for f in DSC00243.jpg DSC01810.jpg DSC01925.jpg DSC02067.jpg DSC00551.jpg DSC07407.jpg; do
  [ -f "$HOME/Downloads/$f" ] && cp "$HOME/Downloads/$f" "$DEST/new/b5/"
done

# Later batches: the Finjan popup and the Japan set.
for i in 6 7; do
  z="$HOME/Downloads/Photos-1-001 ($i).zip"
  [ -f "$z" ] && unzip -q -o "$z" -d "$DEST/new/b$i"
done
# calligraphy stills come out of the video
if [ -f "$DEST/new/b2/IMG_4029.MOV" ]; then
  mkdir -p "$DEST/new/frames"
  ffmpeg -v error -y -ss 9  -i "$DEST/new/b2/IMG_4029.MOV" -frames:v 1 -q:v 2 "$DEST/new/frames/callig_13.jpg"
  ffmpeg -v error -y -ss 17 -i "$DEST/new/b2/IMG_4029.MOV" -frames:v 1 -q:v 2 "$DEST/new/frames/callig_17.jpg"
fi

echo "Done. $(find "$DEST" -type f | wc -l | tr -d ' ') files."
echo "Now run:  python3 tools/build_images.py --source \"$DEST\""
