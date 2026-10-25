"""Build llms-full.txt: the visible text of every English page in one file for AI crawlers and assistants.

Usage (from the site folder):  python _tools/llms_full.py
"""
import pathlib
import re
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://nemauluwatu.com'


class Text(HTMLParser):
    SKIP = ('script', 'style', 'noscript', 'svg', 'nav', 'footer', 'header', 'dialog')

    def __init__(self):
        super().__init__()
        self.out, self.skip, self.title, self.in_title, self.desc = [], 0, '', False, ''
        self.heading = 0
        self.skip_link = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP or (tag == 'a' and a.get('href') == '#main'):
            self.skip += 1
            self.skip_link = tag == 'a'
        if self.skip:
            return
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta' and a.get('name') == 'description':
            self.desc = a.get('content', '')
        elif tag in ('h1', 'h2', 'h3', 'h4'):
            self.out.append('\n\n' + '#' * (int(tag[1]) + 1) + ' ')
            self.heading += 1
        elif tag in ('p', 'figcaption', 'blockquote', 'dt', 'dd', 'tr', 'cite', 'address'):
            self.out.append('\n\n' if tag in ('p', 'blockquote', 'figcaption') else '\n')
        elif tag == 'li':
            self.out.append('\n- ')
        elif tag in ('td', 'th'):
            self.out.append(' | ')
        elif tag == 'button' and 'faq-question' in a.get('class', ''):
            # the question sits in an <h3>; show it as a bold Q line rather than an empty heading
            if self.out and self.out[-1].lstrip('\n').startswith('#'):
                self.out.pop()
            self.out.append('\n\n**Q: ')
        elif tag == 'br':
            self.out.append('\n')

    def handle_endtag(self, tag):
        if tag in self.SKIP or (tag == 'a' and self.skip_link):
            self.skip -= 1
            if tag == 'a':
                self.skip_link = False
        if self.skip:
            return
        if tag == 'title':
            self.in_title = False
        elif tag in ('h1', 'h2', 'h3', 'h4'):
            self.heading = max(0, self.heading - 1)
        elif tag == 'button':
            self.out.append('**')

    def handle_data(self, data):
        if self.skip:
            return
        if self.in_title:
            self.title += data
        else:
            self.out.append(re.sub(r'\s+', ' ', data) if self.heading else data)

    def text(self):
        t = ''.join(self.out)
        t = re.sub(r'[ \t]+', ' ', t)
        t = re.sub(r' *\n *', '\n', t)
        t = re.sub(r'\n{3,}', '\n\n', t)
        return t.strip()


sitemap = (ROOT / 'sitemap.xml').read_text(encoding='utf-8')
urls = [u for u in re.findall(r'<loc>([^<]+)</loc>', sitemap) if not re.search(r'/(de|fr|nl)/$', u)]
parts = ['# Nema. Uluwatu: full site text',
         f'Plain-text version of every English page on {SITE}/ for AI assistants and crawlers. '
         'The short fact sheet is at /llms.txt. Rates, ratings and partner details are kept current on the live pages.']
for u in urls:
    path = ROOT / u.replace(SITE + '/', '') / 'index.html'
    p = Text()
    p.feed(path.read_text(encoding='utf-8'))
    parts.append(f'\n\n---\n\n# {p.title.strip()}\nURL: {u}\nSummary: {p.desc}\n\n{p.text()}')
out = ROOT / 'llms-full.txt'
new = '\n'.join(parts) + '\n'
if not out.exists() or out.read_text(encoding='utf-8') != new:
    out.write_text(new, encoding='utf-8', newline='\n')
    print(f'llms-full.txt written: {len(urls)} pages, {len(new.split())} words')
else:
    print('llms-full.txt unchanged')
