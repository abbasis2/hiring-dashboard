from __future__ import annotations


async def test_list_positions_returns_workbook_rows(client):
    response = await client.get('/api/positions')
    assert response.status_code == 200
    body = response.json()
    assert body['meta']['total'] == 15
    assert body['data'][0]['job_id'].startswith('JOB-')


async def test_filter_active_positions(client):
    response = await client.get('/api/positions?active_only=true')
    assert response.status_code == 200
    assert all(item['active_inactive'] == 'Active' for item in response.json()['data'])


async def test_update_position_persists_excel_fields(client):
    response = await client.get('/api/positions')
    role_id = response.json()['data'][0]['id']

    update_response = await client.put(
        f'/api/positions/{role_id}',
        json={'status': 'Interviewing', 'internal_shortlisted': 9},
    )
    assert update_response.status_code == 200
    assert update_response.json()['data']['status'] == 'Interviewing'
    assert update_response.json()['data']['internal_shortlisted'] == 9
