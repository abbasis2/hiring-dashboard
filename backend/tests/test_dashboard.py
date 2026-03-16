from __future__ import annotations


async def test_dashboard_stats_returns_excel_summary_fields(client):
    response = await client.get('/api/dashboard/stats')
    assert response.status_code == 200
    body = response.json()['data']
    assert body['summary']['total_roles'] == 15
    assert body['summary']['active_open'] == 9
    assert body['summary']['filled'] == 6
    assert body['summary']['fill_rate'] == '40%'


async def test_dashboard_stats_include_breakdowns(client):
    response = await client.get('/api/dashboard/stats')
    assert response.status_code == 200
    body = response.json()['data']
    assert len(body['by_team']) > 0
    assert len(body['departure_type_breakdown']) > 0
    assert len(body['location_breakdown']) > 0


async def test_dashboard_stats_include_new_meta_gender_and_heatmaps(client):
    response = await client.get('/api/dashboard/stats')
    assert response.status_code == 200
    body = response.json()['data']
    assert 'plutus_meta' in body
    assert 'gender_overview' in body
    assert 'attrition_heatmap' in body
    assert 'dropout_heatmap' in body
    assert isinstance(body['gender_overview']['meta'], list)
    assert isinstance(body['attrition_heatmap']['months'], list)


async def test_dashboard_stats_compute_offer_acceptance_and_time_to_fill(client):
    response = await client.get('/api/dashboard/stats')
    assert response.status_code == 200
    summary = response.json()['data']['summary']
    assert summary['offer_acceptance_rate'].endswith('%')
    assert isinstance(summary['avg_time_to_fill'], str)
