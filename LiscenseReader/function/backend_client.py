import requests
import time
import threading

# =========================
# Cau hinh Backend
# =========================
BACKEND_URL = "http://192.168.1.134:8081"
CAMERA_ENDPOINT = "/api/v1/iot/camera"
GATE_ID = 1

# Luu bien so da gui gan day de tranh spam
_sent_plates = {}
_lock = threading.Lock()
COOLDOWN_SECONDS = 3


def _post_plate(plate_number, gate_id):
    url = f"{BACKEND_URL}{CAMERA_ENDPOINT}"
    payload = {"gate_id": gate_id, "plate_number": plate_number}
    try:
        response = requests.post(url, json=payload, timeout=5)
        result = response.json()
        print(f"[Backend] Sent '{plate_number}' -> {result.get('message', 'OK')}")
    except requests.exceptions.ConnectionError:
        print(f"[Backend] ERROR: Khong ket noi duoc toi {url}")
    except Exception as e:
        print(f"[Backend] ERROR: {e}")


def send_plate_to_backend(plate_number, gate_id=GATE_ID):
    now = time.time()
    with _lock:
        if plate_number in _sent_plates:
            if now - _sent_plates[plate_number] < COOLDOWN_SECONDS:
                return
        _sent_plates[plate_number] = now
    t = threading.Thread(target=_post_plate, args=(plate_number, gate_id))
    t.daemon = True
    t.start()
