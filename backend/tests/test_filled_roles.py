from __future__ import annotations


async def test_list_filled_roles(client):
    response = await client.get("/api/filled-roles")
    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["total"] == 6
    assert len(body["data"]) == 6


async def test_update_filled_role(client):
    listing = await client.get("/api/filled-roles")
    role_id = listing.json()["data"][0]["id"]

    response = await client.put(f"/api/filled-roles/{role_id}", json={"notes": "Updated in test"})
    assert response.status_code == 200
    assert response.json()["data"]["notes"] == "Updated in test"


async def test_delete_filled_role(client):
    listing = await client.get("/api/filled-roles")
    role_id = listing.json()["data"][0]["id"]

    delete_response = await client.delete(f"/api/filled-roles/{role_id}")
    assert delete_response.status_code == 200

    after = await client.get("/api/filled-roles")
    ids = [item["id"] for item in after.json()["data"]]
    assert role_id not in ids
