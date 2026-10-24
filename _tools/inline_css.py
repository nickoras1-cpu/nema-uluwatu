"""Inline a minified copy of style.css into every page, so phones can paint without waiting for a separate CSS file.

Usage (from the site folder):  python _tools/inline_css.py

Edit style.css as normal, then run this script. Pages keep a marker so it can be re-run safely.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
css = (ROOT / 'style.css').read_text(encoding='utf-8')

# light minification: drop comments and collapse whitespace
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*([{};:,>])\s*', r'\1', css)
css = css.replace(';}', '}').strip()

link = re.compile(r'<link rel="stylesheet" href="(?:\.\./)*style\.css\?v=\d+">')
block = re.compile(r'<style id="site-css">.*?</style>', re.S)
tag = f'<style id="site-css">{css}</style>'

changed = []
for page in ROOT.rglob('*.html'):
    rel = page.relative_to(ROOT)
    if any(part.startswith(('_', '.')) for part in rel.parts):
        continue
    html = page.read_text(encoding='utf-8')
    new = block.sub(lambda m: tag, html) if block.search(html) else link.sub(lambda m: tag, html, count=1)
    if new != html:
        page.write_text(new, encoding='utf-8', newline='\n')
        changed.append(str(rel))
print(f'CSS {len(css) // 1024} KB inlined into {len(changed)} pages')
