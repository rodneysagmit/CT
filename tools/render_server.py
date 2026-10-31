"""Local server for tools/render-web.html (no Node needed).

Run from the site folder:  python tools/render_server.py
Serves the site folder on http://localhost:8811 and saves rendered PNGs
posted by render-web.html into tools/out/. Local use only.
"""
import http.server
import os
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'out')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def do_POST(self):
        if not self.path.startswith('/save/'):
            self.send_error(404)
            return
        name = os.path.basename(urllib.parse.unquote(self.path[6:]))
        os.makedirs(OUT, exist_ok=True)
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(OUT, name), 'wb') as f:
            f.write(data)
        self.send_response(204)
        self.end_headers()


if __name__ == '__main__':
    http.server.ThreadingHTTPServer(('127.0.0.1', 8811), Handler).serve_forever()
