from PIL import Image
import cv2
import torch
import math
import function.utils_rotate as utils_rotate
import os
import time
import function.helper as helper
import function.backend_client as backend_client
from collections import Counter

# =========================
# Cau hinh
# =========================
phoneCam = "http://192.168.1.106:4747/video"
PROCESS_EVERY_N_FRAMES = 3
FRAME_WIDTH = 480
MIN_CONFIRM_COUNT = 5      # Phai doc duoc cung 1 bien so 5 lan moi xac nhan
DISPLAY_DURATION = 3.0     # Hien thi bien so on dinh trong 3 giay

# =========================
# Load model
# =========================
yolo_LP_detect = torch.hub.load(
    'yolov5', 'custom',
    path='model/LP_detector_nano_61.pt',
    force_reload=False, source='local'
)
yolo_license_plate = torch.hub.load(
    'yolov5', 'custom',
    path='model/LP_ocr_nano_62.pt',
    force_reload=False, source='local'
)
yolo_license_plate.conf = 0.60

# Chuyen model sang GPU
if torch.cuda.is_available():
    yolo_LP_detect.cuda()
    yolo_license_plate.cuda()
    print('[GPU] Models loaded on', torch.cuda.get_device_name(0))
else:
    print('[CPU] CUDA not available, running on CPU')

prev_frame_time = 0
frame_count = 0

# === Bo dem lay mau ===
plate_counter = Counter()     # Dem so lan xuat hien moi bien so
confirmed_plate = None        # Bien so da xac nhan
confirmed_time = 0            # Thoi diem xac nhan
confirmed_box = None          # Vi tri khung bien so

# =========================
# Mo IP camera
# =========================
vid = cv2.VideoCapture(phoneCam)
if not vid.isOpened():
    raise RuntimeError(f"Khong mo duoc IP camera: {phoneCam}")

while True:
    ret, frame = vid.read()
    if not ret or frame is None:
        time.sleep(0.1)
        continue

    frame_count += 1

    # Resize
    h_orig, w_orig = frame.shape[:2]
    if w_orig > FRAME_WIDTH:
        scale = FRAME_WIDTH / w_orig
        frame = cv2.resize(frame, (FRAME_WIDTH, int(h_orig * scale)))

    now = time.time()

    # Chi chay YOLO moi N frame
    if frame_count % PROCESS_EVERY_N_FRAMES == 0:
        plates = yolo_LP_detect(frame, size=640)
        list_plates = plates.pandas().xyxy[0].values.tolist()

        for plate in list_plates:
            x = int(plate[0])
            y = int(plate[1])
            w = int(plate[2] - plate[0])
            h = int(plate[3] - plate[1])
            crop_img = frame[y:y + h, x:x + w]

            lp = ""
            for cc in range(0, 2):
                for ct in range(0, 2):
                    rotated_img = utils_rotate.deskew(crop_img, cc, ct)
                    lp = helper.read_plate(yolo_license_plate, rotated_img)
                    if lp != "unknown":
                        break
                if lp != "unknown":
                    break

            if lp != "unknown":
                plate_counter[lp] += 1
                box = (int(plate[0]), int(plate[1]), int(plate[2]), int(plate[3]))

                # Kiem tra da du so lan xac nhan chua
                if plate_counter[lp] >= MIN_CONFIRM_COUNT and lp != confirmed_plate:
                    confirmed_plate = lp
                    confirmed_time = now
                    confirmed_box = box
                    plate_counter.clear()
                    print(f"[Plate] CONFIRMED: {lp}")
                    backend_client.send_plate_to_backend(lp)

    # === Ve khung va text on dinh ===
    if confirmed_plate and (now - confirmed_time < DISPLAY_DURATION) and confirmed_box:
        x1, y1, x2, y2 = confirmed_box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color=(0, 255, 0), thickness=2)
        cv2.putText(frame, confirmed_plate, (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
    elif confirmed_plate and (now - confirmed_time >= DISPLAY_DURATION):
        # Het thoi gian hien thi -> reset
        confirmed_plate = None
        confirmed_box = None

    # FPS
    if prev_frame_time > 0:
        fps = int(1 / max(now - prev_frame_time, 1e-6))
    else:
        fps = 0
    prev_frame_time = now

    cv2.putText(frame, str(fps), (7, 70),
        cv2.FONT_HERSHEY_SIMPLEX, 2, (100, 255, 0), 2, cv2.LINE_AA)

    cv2.imshow('frame', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

vid.release()
cv2.destroyAllWindows()
