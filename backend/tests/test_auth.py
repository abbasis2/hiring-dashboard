from __future__ import annotations


async def test_protected_route_requires_authentication(raw_client):
    response = await raw_client.get("/api/positions")
    assert response.status_code == 401
    body = response.json()
    assert body["error"] == "HTTPException"


async def test_signup_verify_and_login_flow(raw_client):
    signup = await raw_client.post(
        "/api/auth/signup",
        json={
            "email": "member1@local.test",
            "confirm_email": "member1@local.test",
            "password": "Member#1234",
        },
    )
    assert signup.status_code == 201
    signup_data = signup.json()["data"]
    assert signup_data["email"] == "member1@local.test"
    assert signup_data["verification_code"] is not None

    verify = await raw_client.post(
        "/api/auth/verify-email",
        json={"email": "member1@local.test", "code": signup_data["verification_code"]},
    )
    assert verify.status_code == 200
    assert verify.json()["data"]["email_verified"] is True

    login = await raw_client.post(
        "/api/auth/login",
        json={"email": "member1@local.test", "password": "Member#1234"},
    )
    assert login.status_code == 200
    login_data = login.json()["data"]
    assert login_data["token_type"] == "bearer"
    assert login_data["access_token"]
    assert login_data["user"]["role"] == "user"


async def test_unverified_user_cannot_login(raw_client):
    signup = await raw_client.post(
        "/api/auth/signup",
        json={
            "email": "member2@local.test",
            "confirm_email": "member2@local.test",
            "password": "Member#1234",
        },
    )
    assert signup.status_code == 201

    login = await raw_client.post(
        "/api/auth/login",
        json={"email": "member2@local.test", "password": "Member#1234"},
    )
    assert login.status_code == 403


async def test_non_admin_cannot_manage_users(raw_client):
    signup = await raw_client.post(
        "/api/auth/signup",
        json={
            "email": "member3@local.test",
            "confirm_email": "member3@local.test",
            "password": "Member#1234",
        },
    )
    code = signup.json()["data"]["verification_code"]
    await raw_client.post(
        "/api/auth/verify-email",
        json={"email": "member3@local.test", "code": code},
    )
    login = await raw_client.post(
        "/api/auth/login",
        json={"email": "member3@local.test", "password": "Member#1234"},
    )
    token = login.json()["data"]["access_token"]

    response = await raw_client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


async def test_super_admin_can_manage_users(client, raw_client):
    signup = await raw_client.post(
        "/api/auth/signup",
        json={
            "email": "member4@local.test",
            "confirm_email": "member4@local.test",
            "password": "Member#1234",
        },
    )
    code = signup.json()["data"]["verification_code"]
    await raw_client.post("/api/auth/verify-email", json={"email": "member4@local.test", "code": code})

    users_response = await client.get("/api/users")
    assert users_response.status_code == 200
    users = users_response.json()["data"]
    target = next((user for user in users if user["email"] == "member4@local.test"), None)
    assert target is not None

    revoke = await client.patch(f"/api/users/{target['id']}/access", json={"is_active": False})
    assert revoke.status_code == 200
    assert revoke.json()["data"]["is_active"] is False
