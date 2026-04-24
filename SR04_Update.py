"""
SR04_Update.py - Gia lap cam bien sieu am SR04
Gui POST request len backend de cap nhat trang thai slot

Cach dung:
  python SR04_Update.py                    # Menu tuong tac
  python SR04_Update.py SENSOR_A_001 1 1   # Nhanh: mac=SENSOR_A_001, port=1, occupied=1
  python SR04_Update.py SENSOR_A_001 1 0   # Nhanh: mac=SENSOR_A_001, port=1, available=0
"""

import requests
import sys

BACKEND_URL = "http://192.168.1.134:8081"
ENDPOINT = "/api/v1/parking-slots/sensor"


def send_update(mac, port, is_occupied):
    url = f"{BACKEND_URL}{ENDPOINT}"
    payload = {
        "mac": mac,
        "port": port,
        "is_occupied": is_occupied
    }
    try:
        resp = requests.post(url, json=payload, timeout=5)
        data = resp.json()
        status = "OCCUPIED" if is_occupied else "AVAILABLE"
        print(f"[OK] {mac}:{port} -> {status}")
        print(f"     Response: {data.get('message', '')}")
        if 'data' in data and data['data']:
            d = data['data']
            print(f"     Slot: {d.get('name','')} | {d.get('old_status','')} -> {d.get('new_status','')}")
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] Cannot connect to {url}")
    except Exception as e:
        print(f"[ERROR] {e}")


def interactive_mode():
    print("=" * 50)
    print("  SR04 Sensor Simulator")
    print("=" * 50)
    print(f"  Backend: {BACKEND_URL}")
    print()

    mac = input("  Sensor MAC [SENSOR_A_001]: ").strip() or "SENSOR_A_001"

    while True:
        print()
        print(f"  Current sensor: {mac}")
        print("  ---")
        print("  1) Set OCCUPIED  (co xe)")
        print("  2) Set AVAILABLE (trong)")
        print("  3) Change sensor MAC")
        print("  q) Quit")
        print()

        choice = input("  > ").strip().lower()

        if choice == "1":
            port = input("  Port [1]: ").strip()
            port = int(port) if port else 1
            send_update(mac, port, True)

        elif choice == "2":
            port = input("  Port [1]: ").strip()
            port = int(port) if port else 1
            send_update(mac, port, False)

        elif choice == "3":
            mac = input("  New MAC: ").strip()

        elif choice == "q":
            print("  Bye!")
            break

        else:
            print("  Invalid choice")


if __name__ == "__main__":
    if len(sys.argv) == 4:
        # Quick mode: python SR04_Update.py MAC PORT IS_OCCUPIED
        mac = sys.argv[1]
        port = int(sys.argv[2])
        occupied = sys.argv[3] in ("1", "true", "True", "yes")
        send_update(mac, port, occupied)
    else:
        interactive_mode()
