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
