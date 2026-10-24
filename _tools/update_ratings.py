"""Apply the numbers in _tools/ratings.json to every page and to llms.txt.

Usage (from the site folder):  python _tools/update_ratings.py

Pages mark each number with <span data-r="key">...</span>; llms.txt is
rebuilt from _tools/llms.template.txt. Folders starting with "_" are not
published by GitHub Pages, so this tool never appears on the live site.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOLS = ROOT / '_tools'

data = json.loads((TOOLS / 'ratings.json').read_text(encoding='utf-8'))

span = re.compile(r'(<span data-r="([a-z_]+)">)([^<]*)(</span>)')
meta = re.compile(r'rated [0-9.]+ on Booking\.com')

changed = []
for page in ROOT.rglob('*.html'):
    if any(part.startswith(('_', '.')) for part in page.relative_to(ROOT).parts):
        continue
    text = page.read_text(encoding='utf-8')

    def fill(m):
        key = m.group(2)
        if key not in data:
            sys.exit(f'Unknown rating key "{key}" in {page}')
        return m.group(1) + data[key] + m.group(4)

    new = span.sub(fill, text)
    new = meta.sub(f'rated {data["booking_score"]} on Booking.com', new)
    if new != text:
        page.write_text(new, encoding='utf-8', newline='\n')
        changed.append(str(page.relative_to(ROOT)))

template = (TOOLS / 'llms.template.txt').read_text(encoding='utf-8')
llms = template.format(**data)
target = ROOT / 'llms.txt'
if target.read_text(encoding='utf-8') != llms:
    target.write_text(llms, encoding='utf-8', newline='\n')
    changed.append('llms.txt')

print('Updated: ' + (', '.join(changed) if changed else 'nothing (already current)'))
