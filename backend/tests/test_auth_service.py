"""Tests for auth_service password hashing and JWT issuing - no DB."""

import os
import unittest
from datetime import datetime, timedelta, timezone

os.environ.setdefault("JWT_SECRET_KEY", "test-secret")

import jwt  # noqa: E402

from services import auth_service as svc  # noqa: E402


class PasswordHashing(unittest.TestCase):
    def test_roundtrip_and_salt(self):
        h1 = svc.hash_password("hunter2")
        h2 = svc.hash_password("hunter2")
        self.assertNotEqual(h1, "hunter2")
        self.assertNotEqual(h1, h2)  # random salt
        self.assertTrue(svc.verify_password("hunter2", h1))
        self.assertTrue(svc.verify_password("hunter2", h2))

    def test_wrong_password(self):
        h = svc.hash_password("correct horse")
        self.assertFalse(svc.verify_password("battery staple", h))


class AccessToken(unittest.TestCase):
    def test_encodes_subject_and_expiry(self):
        token = svc.create_access_token(42)
        payload = jwt.decode(token, svc.SECRET_KEY, algorithms=[svc.ALGORITHM])
        self.assertEqual(payload["sub"], "42")
        self.assertGreater(payload["exp"], datetime.now(timezone.utc).timestamp())

    def test_wrong_secret_is_rejected(self):
        token = svc.create_access_token(1)
        with self.assertRaises(jwt.InvalidSignatureError):
            jwt.decode(token, "not-the-secret", algorithms=[svc.ALGORITHM])

    def test_expired_token_is_rejected(self):
        stale = jwt.encode(
            {"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)},
            svc.SECRET_KEY,
            algorithm=svc.ALGORITHM,
        )
        with self.assertRaises(jwt.ExpiredSignatureError):
            jwt.decode(stale, svc.SECRET_KEY, algorithms=[svc.ALGORITHM])

    def test_garbage_token_is_rejected(self):
        with self.assertRaises(jwt.PyJWTError):
            jwt.decode("not.a.jwt", svc.SECRET_KEY, algorithms=[svc.ALGORITHM])


if __name__ == "__main__":
    unittest.main()
