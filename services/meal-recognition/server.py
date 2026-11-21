"""Local multi-food detection. No nutrition or weight is inferred."""
import base64
import io
import json
import secrets
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
from PIL import Image, ImageOps, UnidentifiedImageError

from detection import MODEL, load_predictor
MAX_BODY = 12 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 25_000_000


def make_handler(predict, token):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # Do not log photos, tokens or requests.

        def respond(self, code, payload):
            body = json.dumps(payload).encode()
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def do_GET(self):
            if self.path != '/health':
                return self.respond(404, {'error': 'Adresse inconnue.'})
            return self.respond(200, {'ready': True, 'apiVersion': 2, 'model': MODEL})

        def do_POST(self):
            if self.path != '/recognize':
                return self.respond(404, {'error': 'Adresse inconnue.'})
            if not secrets.compare_digest(self.headers.get('X-Muvlet-Token', ''), token):
                return self.respond(401, {'error': 'Code de connexion incorrect. Vérifie la fenêtre du serveur.'})
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= MAX_BODY:
                    return self.respond(413, {'error': 'Photo trop volumineuse. Reprends une photo plus petite.'})
                self.connection.settimeout(30)
                data = json.loads(self.rfile.read(size))
                raw = base64.b64decode(data['image'], validate=True)
                with Image.open(io.BytesIO(raw)) as source:
                    image = ImageOps.exif_transpose(source).convert('RGB')
                    image.thumbnail((1024, 1024))
                if not isinstance(data, dict):
                    raise ValueError('Invalid request')
                detections = predict(image)
                return self.respond(200, {'apiVersion': 2, 'detections': detections, 'model': MODEL,
                    'imageWidth': image.width, 'imageHeight': image.height,
                    'notice': 'Aliments visibles suggérés. Vérifie chaque zone : erreurs et oublis possibles. Aucun poids ni nutriment mesuré.'})
            except (ValueError, KeyError, TypeError, UnidentifiedImageError, Image.DecompressionBombError):
                return self.respond(400, {'error': 'Image invalide. Prends une nouvelle photo.'})
            except Exception:
                return self.respond(500, {'error': 'Analyse impossible. Vérifie le serveur et réessaie.'})
    return Handler


if __name__ == '__main__':
    print('Chargement du détecteur multi-aliments gratuit. Premier lancement : téléchargement du modèle (plusieurs centaines de Mo).', flush=True)
    predictor = load_predictor()
    token = secrets.token_hex(4)
    server = HTTPServer(('0.0.0.0', 8765), make_handler(predictor, token))
    print('\nSERVEUR PRÊT — port 8765', flush=True)
    print('Code de connexion : ' + token, flush=True)
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
            probe.connect(('192.0.2.1', 80))
            address = probe.getsockname()[0]
        print('Adresse probable : http://' + address + ':8765', flush=True)
    except OSError:
        pass
    print('Dans l’app, utilise l’adresse IPv4 Wi-Fi du PC (commande ipconfig).', flush=True)
    print('Exemple : http://172.20.10.2:8765 — remplace par ton adresse actuelle.', flush=True)
    print('Réseau personnel uniquement. Garde cette fenêtre ouverte.', flush=True)
    server.serve_forever()
