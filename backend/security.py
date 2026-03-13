from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any

PASSWORD_ALGO = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 240_000
TOKEN_DEFAULT_TTL_MINUTES = 60 * 12
TOKEN_VERSION = "v1"


def is_production_runtime() -> bool:
    app_env = os.getenv("APP_ENV", "").strip().lower()
    return os.getenv("VERCEL", "").strip() == "1" or app_env in {"production", "prod"}


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _secret_key() -> str:
    configured = os.getenv("AUTH_SECRET_KEY", "").strip()
    if configured:
        return configured
    if is_production_runtime():
        raise RuntimeError("AUTH_SECRET_KEY is required in production")
    return "local-dev-change-me"


def _token_ttl_minutes() -> int:
    try:
        return max(1, int(os.getenv("AUTH_TOKEN_TTL_MINUTES", str(TOKEN_DEFAULT_TTL_MINUTES))))
    except ValueError:
        return TOKEN_DEFAULT_TTL_MINUTES


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"{PASSWORD_ALGO}${PASSWORD_ITERATIONS}${salt.hex()}${derived.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algo, iterations_raw, salt_hex, digest_hex = encoded.split("$", 3)
        if algo != PASSWORD_ALGO:
            return False
        iterations = int(iterations_raw)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except (ValueError, TypeError):
        return False

    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(actual, expected)


def generate_verification_code() -> str:
    return f"{secrets.randbelow(900000) + 100000:06d}"


def _b64_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("utf-8").rstrip("=")


def _b64_decode(value: str) -> bytes:
    padding = "=" * ((4 - len(value) % 4) % 4)
    return base64.urlsafe_b64decode(value + padding)


def create_access_token(*, user_id: int, email: str, role: str) -> str:
    expires_at = int(time.time()) + (_token_ttl_minutes() * 60)
    payload = {
        "v": TOKEN_VERSION,
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": expires_at,
    }
    payload_blob = _b64_encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    signature = hmac.new(_secret_key().encode("utf-8"), payload_blob.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_blob}.{signature}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload_blob, signature = token.split(".", 1)
    except ValueError as exc:
        raise ValueError("Invalid token format") from exc

    expected_sig = hmac.new(_secret_key().encode("utf-8"), payload_blob.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_sig):
        raise ValueError("Invalid token signature")

    try:
        payload = json.loads(_b64_decode(payload_blob).decode("utf-8"))
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError("Invalid token payload") from exc

    if payload.get("v") != TOKEN_VERSION:
        raise ValueError("Invalid token version")

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or expires_at < int(time.time()):
        raise ValueError("Token expired")

    return payload


def verification_expiry(minutes: int = 15) -> datetime:
    return utc_now_naive() + timedelta(minutes=minutes)


def validate_security_config() -> None:
    _secret_key()
