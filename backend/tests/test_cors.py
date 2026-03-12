from __future__ import annotations


async def test_cors_preflight_allows_vercel_preview_origin(client):
    origin = "https://hiring-dashboard-frontend-abc123.vercel.app"
    response = await client.options(
        "/api/master-options",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-client-request-id",
        },
    )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert "x-client-request-id" in response.headers.get("access-control-allow-headers", "").lower()
