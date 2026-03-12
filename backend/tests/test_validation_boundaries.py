from __future__ import annotations


async def test_create_position_role_title_max_length_boundary(client):
    response = await client.post(
        "/api/positions",
        json={
            "job_id": "",
            "role_title": "R" * 255,
            "team": "Team 27",
            "location": "CN/Lahore",
            "departure_type": "Backfill",
            "status": "Sourcing",
            "active_inactive": "Active",
        },
    )
    assert response.status_code == 201


async def test_create_position_role_title_overflow_returns_422(client):
    response = await client.post(
        "/api/positions",
        json={
            "job_id": "",
            "role_title": "R" * 256,
            "team": "Team 27",
            "location": "CN/Lahore",
            "departure_type": "Backfill",
            "status": "Sourcing",
            "active_inactive": "Active",
        },
    )
    assert response.status_code == 422


async def test_create_position_negative_pipeline_counts_return_422(client):
    response = await client.post(
        "/api/positions",
        json={
            "job_id": "",
            "role_title": "Data Engineer",
            "team": "Team 27",
            "location": "CN/Lahore",
            "departure_type": "Backfill",
            "status": "Sourcing",
            "active_inactive": "Active",
            "internal_shortlisted": -1,
        },
    )
    assert response.status_code == 422


async def test_create_position_duplicate_job_id_returns_409(client):
    response = await client.post(
        "/api/positions",
        json={
            "job_id": "JOB-001",
            "role_title": "Duplicate ID Attempt",
            "team": "Team 27",
            "location": "CN/Lahore",
            "departure_type": "Backfill",
            "status": "Sourcing",
            "active_inactive": "Active",
        },
    )
    assert response.status_code == 409


async def test_update_filled_role_status_max_length_boundary(client):
    read = await client.get("/api/filled-roles")
    role_id = read.json()["data"][0]["id"]

    valid = await client.put(f"/api/filled-roles/{role_id}", json={"status": "S" * 64})
    invalid = await client.put(f"/api/filled-roles/{role_id}", json={"status": "S" * 65})
    assert valid.status_code == 200
    assert invalid.status_code == 422


async def test_create_job_description_boundary_validation(client):
    valid = await client.post(
        "/api/jobs",
        json={
            "role_title": "Boundary QA Engineer",
            "department": "Team 27",
            "location": "Lahore",
            "employment_type": "Full-time",
            "status": "open",
            "description": "D" * 5000,
            "requirements": "Python",
        },
    )
    invalid = await client.post(
        "/api/jobs",
        json={
            "role_title": "Boundary QA Engineer 2",
            "department": "Team 27",
            "location": "Lahore",
            "employment_type": "Full-time",
            "status": "open",
            "description": "D" * 5001,
            "requirements": "Python",
        },
    )
    assert valid.status_code == 201
    assert invalid.status_code == 422
