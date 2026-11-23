import base64
import io
import json
import threading
import unittest
from http.client import HTTPConnection
from http.server import HTTPServer
from PIL import Image
from server import make_handler

class ServerTests(unittest.TestCase):
    def setUp(self):
        self.calls=[]
        def predict(image):
            self.calls.append(image.size)
            return [{'label':'chicken','score':0.75,'box':[0,0,.4,1]}, {'label':'rice','score':0.65,'box':[.5,0,1,1]}]
        self.server=HTTPServer(('127.0.0.1',0),make_handler(predict,'test-code'))
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True)
        self.thread.start()
    def tearDown(self):
        self.server.shutdown();self.server.server_close();self.thread.join()
    def post(self,payload,token='test-code'):
        c=HTTPConnection('127.0.0.1',self.server.server_port)
        c.request('POST','/recognize',json.dumps(payload),{'X-Muvlet-Token':token,'Content-Type':'application/json'})
        r=c.getresponse();status=r.status;data=json.loads(r.read());c.close();return status,data
    def test_rejects_wrong_token_without_inference(self):
        self.assertEqual(self.post({'image':'abc'},'wrong')[0],401)
        self.assertEqual(self.calls,[])
    def test_rejects_invalid_image_without_inference(self):
        self.assertEqual(self.post({'image':base64.b64encode(b'not a photo').decode()})[0],400)
        self.assertEqual(self.calls,[])
    def test_photo_decoded_and_no_nutrition_fabricated(self):
        image=Image.new('RGB',(32,24),'red');buf=io.BytesIO();image.save(buf,format='JPEG')
        status,data=self.post({'image':base64.b64encode(buf.getvalue()).decode()})
        self.assertEqual(status,200);self.assertEqual(self.calls,[(32,24)])
        self.assertEqual(data['apiVersion'],2)
        self.assertEqual(len(data['detections']),2)
        self.assertEqual(data['detections'][0]['label'],'chicken')
        self.assertEqual(data['imageWidth'],32)
        self.assertNotIn('calories',data);self.assertNotIn('grams',data)
    def test_empty_detection_is_success(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
        self.server=HTTPServer(('127.0.0.1',0),make_handler(lambda image: [],'test-code'))
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True); self.thread.start()
        buf=io.BytesIO();Image.new('RGB',(8,8)).save(buf,format='PNG')
        status,data=self.post({'image':base64.b64encode(buf.getvalue()).decode()})
        self.assertEqual(status,200);self.assertEqual(data['detections'],[])
    def test_health_reports_new_protocol(self):
        c=HTTPConnection('127.0.0.1',self.server.server_port);c.request('GET','/health')
        r=c.getresponse();self.assertEqual(r.status,200);self.assertEqual(json.loads(r.read())['apiVersion'],2);c.close()
if __name__=='__main__':unittest.main()
