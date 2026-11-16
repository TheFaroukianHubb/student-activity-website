
from pathlib import Path
import json

ROOT = Path(__file__).parent
PHOTO_DIR = ROOT / "photos"

categories = {
    "events": "Events",
    "activities": "Activities",
    "other": "Other",
    "behind-the-scenes": "Behind the Scenes",
    "good-old-days": "The Good Old Days",
}

extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

print("PHOTO DIRECTORY:", PHOTO_DIR.resolve())
print("CATEGORY FOLDERS:", list(PHOTO_DIR.iterdir()))
print("OLD PHOTOS FOLDER:", (PHOTO_DIR / "good-old-days").resolve())
print("OLD PHOTOS CONTENTS:", list((PHOTO_DIR / "good-old-days").iterdir()))

photos = []

for folder, label in categories.items():
    directory = PHOTO_DIR / folder

    if not directory.exists():
        print(f"Folder not found: {directory}")
        continue

    for file in sorted(directory.rglob("*")):
        if file.is_file() and file.suffix.lower() in extensions:
            photos.append({
                "id": f"photo-{len(photos) + 1:03}", 
                "title": file.stem,
"category": folder,
"categoryLabel": label,
                "src": file.relative_to(ROOT).as_posix(),
            })

output = ROOT / "gallery-data.js"
output = ROOT / "gallery-data.js"
output.write_text(
    "window.galleryPhotos = " +
    json.dumps(photos, ensure_ascii=False, indent=2) +
    ";\n",
    encoding="utf-8"
)

print(f"Generated {len(photos)} photos in gallery-data.js")

print(f"Generated {len(photos)} photos in gallery-data.js")
