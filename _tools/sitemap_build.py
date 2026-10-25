"""Refresh <lastmod> in sitemap.xml from each page's last git commit date.

Usage (from the site folder):  python _tools/sitemap_build.py
Run it after committing content changes, then commit the sitemap.
"""
import datetime
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://nemauluwatu.com'
today = datetime.date.today().isoformat()


def last_commit_date(path):
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', str(path)], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
        return out or today
    except Exception:
        return today


sm = (ROOT / 'sitemap.xml').read_text(encoding='utf-8')


def fix(m):
    url = m.group(1)
    rel = url.replace(SITE + '/', '')
    page = ROOT / rel / 'index.html'
    if not page.exists():
        return m.group(0)
    if (ROOT / rel / 'index.html').read_text(encoding='utf-8') != (ROOT / rel / 'index.html').read_text(encoding='utf-8'):
        pass
    # uncommitted edits count as today
    dirty = subprocess.run(['git', 'status', '--porcelain', '--', str(page)], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    date = today if dirty else last_commit_date(page)
    return f'<loc>{url}</loc>{m.group(2)}<lastmod>{date}</lastmod>'


new = re.sub(r'<loc>([^<]+)</loc>(\s*)<lastmod>[^<]+</lastmod>', fix, sm)
if new != sm:
    (ROOT / 'sitemap.xml').write_text(new, encoding='utf-8', newline='\n')
    print('sitemap.xml lastmod refreshed')
else:
    print('sitemap.xml unchanged')
