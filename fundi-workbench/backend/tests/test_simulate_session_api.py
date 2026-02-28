import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient


_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.main import app  # noqa: E402


class SimulateSessionApiTests(unittest.TestCase):
    def test_create_start_stop_reset_session(self) -> None:
        client = TestClient(app)

        create = client.post(
            '/api/v1/simulate/session',
            json={
                'board': 'wokwi-esp32-devkit-v1',
                'artifact_type': 'raw-bin',
                'artifact_payload': 'AQID',
                'simulation_hints': {'engine': 'esp32'},
            },
        )
        self.assertEqual(create.status_code, 200)
        payload = create.json()
        self.assertIn('id', payload)
        session_id = payload['id']

        start = client.post(f'/api/v1/simulate/session/{session_id}/start')
        self.assertEqual(start.status_code, 200)
        self.assertEqual(start.json().get('status'), 'running')

        reset = client.post(f'/api/v1/simulate/session/{session_id}/reset')
        self.assertEqual(reset.status_code, 200)
        self.assertEqual(reset.json().get('status'), 'running')

        stop = client.post(f'/api/v1/simulate/session/{session_id}/stop')
        self.assertEqual(stop.status_code, 200)
        self.assertEqual(stop.json().get('status'), 'stopped')

    def test_websocket_events_stream(self) -> None:
        client = TestClient(app)

        create = client.post(
            '/api/v1/simulate/session',
            json={
                'board': 'wokwi-pi-pico',
                'artifact_type': 'raw-bin',
                'artifact_payload': 'AQID',
            },
        )
        self.assertEqual(create.status_code, 200)
        session_id = create.json()['id']

        start = client.post(f'/api/v1/simulate/session/{session_id}/start')
        self.assertEqual(start.status_code, 200)

        with client.websocket_connect(f'/api/v1/simulate/session/{session_id}/events') as ws:
            first = ws.receive_json()
            self.assertEqual(first.get('type'), 'session-created')

            got_serial = False
            for _ in range(6):
                event = ws.receive_json()
                if event.get('type') == 'serial':
                    got_serial = True
                    break
            self.assertTrue(got_serial)


if __name__ == '__main__':
    unittest.main()
