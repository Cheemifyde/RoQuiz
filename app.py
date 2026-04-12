"""
Sleepy Savior — Web Version
=====================================
pip install flask onnxruntime opencv-python numpy
python app.py  →  open http://127.0.0.1:5000
"""

from flask import Flask, render_template_string, request, jsonify
import numpy as np
import json, os, base64, cv2
import onnxruntime as ort

# ── Config ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.expanduser('~/Downloads/drowsy_detector')
MODEL_PATH = os.path.join(BASE_DIR, 'drowsy_model.onnx')
LABEL_PATH = os.path.join(BASE_DIR, 'class_labels.json')

IMG_SIZE     = 224
CONF_THRESH  = 0.50   # must be confident before acting
ALERT_LABELS = {'drowsy', 'head drop', 'yawn', 'distracted'}

# ── Load model ─────────────────────────────────────────────────────────────────
session    = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
input_name = session.get_inputs()[0].name

with open(LABEL_PATH) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}

MEAN = np.array([0.485, 0.456, 0.406], dtype='float32')
STD  = np.array([0.229, 0.224, 0.225], dtype='float32')

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

from collections import deque
pred_history = deque(maxlen=20)  # smooth over more frames

def preprocess(img_rgb):
    resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE)).astype('float32')
    resized = (resized / 255.0 - MEAN) / STD
    resized = np.transpose(resized, (2, 0, 1))
    return np.expand_dims(resized, axis=0).astype('float32')

def predict(img_rgb):
    logits = session.run(None, {input_name: preprocess(img_rgb)})[0][0]
    e      = np.exp(logits - np.max(logits))
    probs  = e / e.sum()
    pred_history.append(probs)
    avg    = np.mean(pred_history, axis=0)
    top    = int(np.argmax(avg))
    conf   = float(avg[top])
    if conf < CONF_THRESH:
        return 'awake', conf, False   # default to awake when unsure
    label = label_map[top]
    if label.lower() in {'phone', 'smoking'}:
        return 'awake', conf, False
    return label, conf, label.lower() in ALERT_LABELS

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
  <title>Sleepy Savior</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #060608;
      color: white;
      font-family: 'Share Tech Mono', monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    h1 {
      font-family: 'Orbitron', monospace;
      font-size: 1.8rem;
      letter-spacing: 8px;
      margin-bottom: 18px;
      background: linear-gradient(90deg, #00e5ff, #7b2ff7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-transform: uppercase;
    }
    #container {
      position: relative;
      width: 640px;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 40px rgba(0,200,255,0.15);
    }
    video {
      width: 640px; height: 480px;
      object-fit: cover;
      display: block;
      border-radius: 10px;
    }
    canvas { display: none; }

    #status-bar {
      position: absolute;
      top: 0; left: 0; width: 100%;
      background: rgba(10,10,15,0.88);
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    #label {
      font-family: 'Orbitron', monospace;
      font-size: 1.2rem;
      font-weight: bold;
      letter-spacing: 3px;
      transition: color 0.3s;
    }
    #meter-wrap { text-align: right; }
    #meter-label { font-size: 0.55rem; color: #888; letter-spacing: 3px; margin-bottom: 5px; }
    #meter-bar-bg {
      width: 200px; height: 14px;
      background: #1a1a2e;
      border-radius: 7px;
      overflow: hidden;
      border: 1px solid #333;
    }
    #meter-bar {
      height: 100%; width: 0%;
      border-radius: 7px;
      transition: width 0.2s;
      background: linear-gradient(90deg, #00e5ff, #ff2200);
    }
    #face-box {
      position: absolute;
      border: 2px solid #00e5ff;
      border-radius: 4px;
      display: none;
      box-shadow: 0 0 12px rgba(0,229,255,0.5);
      transition: border-color 0.2s, box-shadow 0.2s;
      z-index: 5;
    }
    #face-box.alert {
      border-color: #ff2200;
      box-shadow: 0 0 20px rgba(255,30,0,0.7);
    }
    #flash-border {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      border-radius: 10px;
      pointer-events: none;
      display: none;
      border: 8px solid #ff2200;
      animation: flashBorder 0.4s infinite alternate;
      box-shadow: inset 0 0 80px rgba(255,30,0,0.4), 0 0 60px rgba(255,30,0,0.7);
      z-index: 20;
    }
    #flash-border.show { display: block; }
    @keyframes flashBorder {
      from { opacity: 1;   border-color: #ff2200; box-shadow: inset 0 0 80px rgba(255,30,0,0.4), 0 0 60px rgba(255,30,0,0.7); }
      to   { opacity: 0.2; border-color: #ff6600; box-shadow: inset 0 0 30px rgba(255,80,0,0.1), 0 0 20px rgba(255,80,0,0.2); }
    }
    #timestamp {
      position: absolute;
      bottom: 8px; left: 12px;
      font-size: 0.65rem; color: #444;
      z-index: 10;
    }
  </style>
</head>
<body>
  <h1>😴 Sleepy Savior</h1>
  <div id="container">
    <video id="video" autoplay playsinline muted></video>
    <canvas id="canvas"></canvas>
    <div id="status-bar">
      <div id="label" style="color:#00e5ff">STARTING...</div>
      <div id="meter-wrap">
        <div id="meter-label">DROWSY METER</div>
        <div id="meter-bar-bg"><div id="meter-bar"></div></div>
      </div>
    </div>
    <div id="face-box"></div>
    <div id="flash-border"></div>
    <div id="timestamp"></div>
  </div>

  <script>
    const video   = document.getElementById('video');
    const canvas  = document.getElementById('canvas');
    const ctx     = canvas.getContext('2d');
    const labelEl = document.getElementById('label');
    const meterEl = document.getElementById('meter-bar');
    const flashEl = document.getElementById('flash-border');
    const faceBox = document.getElementById('face-box');
    const tsEl    = document.getElementById('timestamp');

    // Drowsy counter — needs 50 consecutive drowsy frames to alert (~6 seconds)
    let drowsyCount  = 0;
    let cooldown     = 0;
    let alertPlaying = false;
    const THRESHOLD  = 50;

    // ── Audio ─────────────────────────────────────────────────────────────────
    let audioCtx = null;
    function playBeep() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.5, 1.0].forEach(offset => {
          const osc  = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + offset);
          osc.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + offset + 0.3);
          gain.gain.setValueAtTime(0.7, audioCtx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + offset + 0.4);
          osc.start(audioCtx.currentTime + offset);
          osc.stop(audioCtx.currentTime + offset + 0.4);
        });
      } catch(e) { console.warn('Audio:', e); }
    }

    // ── Camera ────────────────────────────────────────────────────────────────
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      .then(stream => { video.srcObject = stream; })
      .catch(err   => { labelEl.textContent = 'CAMERA ERROR'; labelEl.style.color = '#f00'; });

    // ── Main loop ─────────────────────────────────────────────────────────────
    async function sendFrame() {
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0);
      const b64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

      try {
        const res  = await fetch('/predict', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({image: b64})
        });
        const data = await res.json();

        const label    = data.label.toUpperCase();
        const conf     = Math.round(data.conf * 100);
        const isDrowsy = data.is_drowsy;
        const face     = data.face;

        labelEl.textContent = `${label}  ${conf}%`;
        labelEl.style.color = isDrowsy ? '#ff3300' : '#00e5ff';

        // Face box
        if (face) {
          faceBox.style.display = 'block';
          faceBox.style.left    = face.x1 + 'px';
          faceBox.style.top     = (face.y1 + 44) + 'px';
          faceBox.style.width   = (face.x2 - face.x1) + 'px';
          faceBox.style.height  = (face.y2 - face.y1) + 'px';
          faceBox.className     = isDrowsy ? 'alert' : '';
        } else {
          faceBox.style.display = 'none';
        }

        // Counter: goes up by 1 when drowsy, down by 3 when not — decays fast
        if (isDrowsy) drowsyCount = Math.min(drowsyCount + 1, THRESHOLD + 10);
        else          drowsyCount = Math.max(drowsyCount - 3, 0);

        if (cooldown > 0) cooldown--;

        const pct = Math.min((drowsyCount / THRESHOLD) * 100, 100);
        meterEl.style.width = pct + '%';

        if (drowsyCount >= THRESHOLD) {
          flashEl.classList.add('show');
          if (!alertPlaying && cooldown === 0) {
            alertPlaying = true;
            cooldown = 80;
            playBeep();
            setTimeout(() => { alertPlaying = false; }, 2500);
          }
        } else {
          flashEl.classList.remove('show');
        }

      } catch(e) { console.error(e); }

      tsEl.textContent = new Date().toLocaleTimeString();
      setTimeout(sendFrame, 120);
    }

    video.addEventListener('loadedmetadata', () => setTimeout(sendFrame, 800));
  </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML)

@app.route('/predict', methods=['POST'])
def predict_route():
    data     = request.json['image']
    img_data = base64.b64decode(data)
    arr      = np.frombuffer(img_data, np.uint8)
    frame    = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify(label='awake', conf=0.0, is_drowsy=False, face=None)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    dets = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(30, 30))

    face_info = None
    label, conf, is_drowsy = 'awake', 0.0, False

    if len(dets) > 0:
        areas       = [w * h for (x, y, w, h) in dets]
        x, y, w, h = dets[int(np.argmax(areas))]
        h_img, w_img = frame.shape[:2]
        m  = int(0.2 * max(w, h))
        x1, y1 = max(0, x-m),       max(0, y-m)
        x2, y2 = min(w_img, x+w+m), min(h_img, y+h+m)

        face_crop = frame[y1:y2, x1:x2]
        face_rgb  = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
        label, conf, is_drowsy = predict(face_rgb)
        face_info = {'x1': int(x1), 'y1': int(y1), 'x2': int(x2), 'y2': int(y2)}

    return jsonify(label=label, conf=round(conf, 3), is_drowsy=bool(is_drowsy), face=face_info)

if __name__ == '__main__':
    print(f'Classes: {list(label_map.values())}')
    print('Open http://127.0.0.1:5000 in your browser')
    app.run(debug=False, port=5000)
