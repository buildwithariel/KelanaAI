"""
End-to-end API tests against an isolated in-file SQLite database.

The real Postgres dev DB is never touched: DATABASE_URL is repointed to a
throwaway file under the OS temp dir before the app is imported, and the file
is deleted when the module finishes.

Not covered here (needs live AWS credentials / spends Bedrock tokens):
  - POST /api/v1/trips/{id}/generate
  - POST /api/v1/conversations/{id}/messages
"""

import os
import pathlib
import tempfile
import unittest
import uuid

import sqlalchemy

_DB_PATH = pathlib.Path(tempfile.gettempdir()) / "kelana_api_test.db"
_DB_PATH.unlink(missing_ok=True)
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_PATH.as_posix()}"
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")

import database  # noqa: E402

database.engine = sqlalchemy.create_engine(
    os.environ["DATABASE_URL"], connect_args={"check_same_thread": False}
)
database.SessionLocal.configure(bind=database.engine)

import main  # noqa: E402  — runs init_db() against the patched engine
from fastapi.testclient import TestClient  # noqa: E402

client = TestClient(main.app)


def tearDownModule():
    database.engine.dispose()
    _DB_PATH.unlink(missing_ok=True)


def register(name="Traveller"):
    email = f"test-{uuid.uuid4().hex[:12]}@example.com"
    password = "password123"
    r = client.post(
        "/api/v1/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert r.status_code == 201, r.text
    token = client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    ).json()["access_token"]
    return email, {"Authorization": f"Bearer {token}"}


def make_trip(headers, budget=500, days=5):
    r = client.post(
        "/api/v1/trips",
        headers=headers,
        json={
            "destination": "japan",
            "days": days,
            "budget": budget,
            "currency": "USD",
            "travel_month": "December",
            "travel_style": "Solo",
        },
    )
    assert r.status_code == 200, r.text
    return r.json()


class Auth(unittest.TestCase):
    def test_register_login_me(self):
        email, headers = register("Alice")
        body = client.get("/api/v1/auth/me", headers=headers).json()
        self.assertEqual(body["email"], email)
        self.assertEqual(body["total_trips"], 0)
        self.assertIn("created_at", body)

    def test_duplicate_email_conflicts(self):
        email, _ = register()
        r = client.post(
            "/api/v1/auth/register",
            json={"name": "X", "email": email, "password": "password123"},
        )
        self.assertEqual(r.status_code, 409)

    def test_invalid_email_rejected(self):
        r = client.post(
            "/api/v1/auth/register",
            json={"name": "X", "email": "notanemail", "password": "password123"},
        )
        self.assertEqual(r.status_code, 422)

    def test_login_wrong_password(self):
        email, _ = register()
        r = client.post("/api/v1/auth/login", json={"email": email, "password": "nope"})
        self.assertEqual(r.status_code, 401)

    def test_login_unknown_email(self):
        r = client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@example.com", "password": "x"},
        )
        self.assertEqual(r.status_code, 401)

    def test_me_requires_a_valid_token(self):
        self.assertEqual(client.get("/api/v1/auth/me").status_code, 401)
        self.assertEqual(
            client.get("/api/v1/auth/me", headers={"Authorization": "Bearer garbage"}).status_code,
            401,
        )


class Trips(unittest.TestCase):
    def test_create_sets_derived_fields(self):
        _, h = register()
        trip = make_trip(h, budget=500)
        self.assertEqual(trip["category"], "Backpacker")
        self.assertEqual(trip["travel_season"], "Peak Season")

    def test_list_is_scoped_to_owner(self):
        _, a = register("A")
        _, b = register("B")
        make_trip(a)
        self.assertEqual(len(client.get("/api/v1/trips", headers=b).json()), 0)
        self.assertEqual(len(client.get("/api/v1/trips", headers=a).json()), 1)

    def test_cannot_read_someone_elses_trip(self):
        _, a = register("A")
        _, b = register("B")
        trip = make_trip(a)
        self.assertEqual(client.get(f"/api/v1/trips/{trip['id']}", headers=b).status_code, 403)

    def test_missing_trip_is_404(self):
        _, h = register()
        self.assertEqual(client.get("/api/v1/trips/99999999", headers=h).status_code, 404)

    def test_update_budget_recalculates_category(self):
        _, h = register()
        trip = make_trip(h, budget=500)  # Backpacker
        r = client.put(f"/api/v1/trips/{trip['id']}", headers=h, json={"budget": 5000})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["category"], "Luxury")

    def test_delete_is_owner_only(self):
        _, a = register("A")
        _, b = register("B")
        trip = make_trip(a)
        self.assertEqual(client.delete(f"/api/v1/trips/{trip['id']}", headers=b).status_code, 403)
        self.assertEqual(client.delete(f"/api/v1/trips/{trip['id']}", headers=a).status_code, 200)
        self.assertEqual(client.get(f"/api/v1/trips/{trip['id']}", headers=a).status_code, 404)


class Conversations(unittest.TestCase):
    def test_create_and_list(self):
        _, h = register()
        r = client.post("/api/v1/conversations", headers=h, json={})
        self.assertEqual(r.status_code, 201)
        cid = r.json()["conversation_id"]
        listed = client.get("/api/v1/conversations", headers=h).json()
        self.assertTrue(any(c["id"] == cid for c in listed))

    def test_cannot_read_someone_elses_messages(self):
        _, a = register("A")
        _, b = register("B")
        cid = client.post("/api/v1/conversations", headers=a, json={}).json()["conversation_id"]
        self.assertEqual(
            client.get(f"/api/v1/conversations/{cid}/messages", headers=b).status_code, 403
        )

    def test_missing_conversation_is_404(self):
        _, h = register()
        self.assertEqual(
            client.get("/api/v1/conversations/99999999/messages", headers=h).status_code, 404
        )


class RemovedRoutes(unittest.TestCase):
    def test_old_assistant_routes_are_gone(self):
        self.assertEqual(client.post("/api/v1/assistant", json={"question": "hi"}).status_code, 404)
        self.assertEqual(client.post("/api/v1/ask", json={"question": "hi"}).status_code, 404)


if __name__ == "__main__":
    unittest.main()
