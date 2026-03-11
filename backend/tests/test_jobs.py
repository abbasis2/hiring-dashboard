from __future__ import annotations


async def test_list_jobs_returns_seeded_records(client):
    response = await client.get("/api/jobs")
    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["total"] == 2
    assert len(body["data"]) == 2


async def test_search_jobs_filters_results(client):
    response = await client.get("/api/jobs?search=Associate")
    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["total"] == 1
    assert body["data"][0]["role_title"] == "Associate AI Engineer"


async def test_create_and_update_job(client):
    create_response = await client.post(
        "/api/jobs",
        json={
            "role_title": "Principal Recruiter",
            "department": "Talent",
            "location": "Lahore",
            "employment_type": "Full-time",
            "status": "open",
            "description": "Lead senior hiring.",
            "requirements": "Recruiting, stakeholder management"
        },
    )
    assert create_response.status_code == 201
    job_id = create_response.json()["data"]["id"]

    update_response = await client.put(
        f"/api/jobs/{job_id}",
        json={"status": "paused"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["status"] == "paused"
