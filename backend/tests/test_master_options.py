from __future__ import annotations


EXPECTED_FIELDS = {
    "team",
    "location",
    "departure_type",
    "outstanding_status",
    "active_inactive",
    "filled_status",
}


async def test_master_options_seeded_and_grouped(client):
    response = await client.get("/api/master-options")
    assert response.status_code == 200
    body = response.json()
    assert set(body["data"].keys()) == EXPECTED_FIELDS
    assert all(len(options) > 0 for options in body["data"].values())


async def test_add_master_option_reflects_in_field_listing(client):
    create_response = await client.post("/api/master-options/team", json={"value": "Team Z"})
    assert create_response.status_code == 201
    created = create_response.json()["data"]
    assert created["field_key"] == "team"
    assert created["value"] == "Team Z"

    list_response = await client.get("/api/master-options/team")
    assert list_response.status_code == 200
    assert any(option["value"] == "Team Z" for option in list_response.json()["data"])


async def test_add_master_option_duplicate_returns_409(client):
    first = await client.post("/api/master-options/location", json={"value": "Remote"})
    second = await client.post("/api/master-options/location", json={"value": "Remote"})
    assert first.status_code == 201
    assert second.status_code == 409


async def test_add_master_option_unknown_field_returns_404(client):
    response = await client.post("/api/master-options/unknown-field", json={"value": "X"})
    assert response.status_code == 404


async def test_add_master_option_boundary_length_validation(client):
    valid = await client.post("/api/master-options/team", json={"value": "T" * 255})
    invalid = await client.post("/api/master-options/team", json={"value": "T" * 256})
    assert valid.status_code == 201
    assert invalid.status_code == 422
