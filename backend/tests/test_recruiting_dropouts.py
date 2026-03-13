from __future__ import annotations


async def test_recruiting_dropouts_crud(client):
    create_response = await client.post(
        "/api/recruiting-dropouts",
        json={
            "job_id": "JOB-777",
            "role_title": "AI Engineer",
            "team": "Team 27",
            "location": "CN/Lahore",
            "stage": "Technical Interview",
            "dropout_reason": "Accepted another offer",
            "candidate_gender": "Female",
            "dropout_date": "2026-03-01",
            "reason_why_next_steps": "Candidate accepted external offer. Improve compensation benchmarking.",
            "status": "Closed",
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()["data"]
    assert created["stage"] == "Technical Interview"

    read_response = await client.get("/api/recruiting-dropouts")
    assert read_response.status_code == 200
    assert any(item["id"] == created["id"] for item in read_response.json()["data"])

    update_response = await client.put(
        f"/api/recruiting-dropouts/{created['id']}",
        json={"stage": "Final Interview", "status": "Open"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["stage"] == "Final Interview"
    assert update_response.json()["data"]["status"] == "Open"

    delete_response = await client.delete(f"/api/recruiting-dropouts/{created['id']}")
    assert delete_response.status_code == 200


async def test_recruiting_dropout_updates_dashboard_heatmap(client):
    create_response = await client.post(
        "/api/recruiting-dropouts",
        json={
            "job_id": "JOB-778",
            "role_title": "Senior AI Engineer",
            "team": "Team 35",
            "location": "CN/Lahore",
            "stage": "Offer",
            "dropout_reason": "Compensation mismatch",
            "candidate_gender": "Male",
            "dropout_date": "2026-02-10",
            "reason_why_next_steps": "Need tighter salary band alignment.",
            "status": "Closed",
        },
    )
    assert create_response.status_code == 201

    dashboard_response = await client.get("/api/dashboard/stats")
    assert dashboard_response.status_code == 200
    heatmap = dashboard_response.json()["data"]["dropout_heatmap"]
    labels = [row["label"] for row in heatmap["rows"]]
    assert "Offer" in labels
