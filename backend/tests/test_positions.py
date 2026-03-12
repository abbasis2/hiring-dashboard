from __future__ import annotations

import re

JOB_ID_PATTERN = re.compile(r'^JOB-(\d+)$')


def _suffix(job_id: str) -> int:
    match = JOB_ID_PATTERN.fullmatch(job_id)
    assert match is not None
    return int(match.group(1))


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


async def test_create_position_without_job_id_auto_generates_and_list_still_loads(client):
    existing_response = await client.get('/api/positions')
    existing_ids = [item['job_id'] for item in existing_response.json()['data']]
    max_before = max(_suffix(job_id) for job_id in existing_ids)

    create_response = await client.post(
        '/api/positions',
        json={
            'job_id': '',
            'role_title': 'Test Position',
            'team': 'Team 27',
            'location': 'Lahore',
            'backfill_reason': '',
            'departure_type': 'Backfill',
            'status': 'Sourcing',
            'active_inactive': 'Active',
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()['data']
    assert JOB_ID_PATTERN.fullmatch(created['job_id']) is not None
    assert created['job_id'] == f'JOB-{max_before + 1:03d}'

    list_response = await client.get('/api/positions')
    assert list_response.status_code == 200
    payload = list_response.json()['data']
    assert any(item['id'] == created['id'] and item['job_id'] == created['job_id'] for item in payload)


async def test_auto_generated_job_ids_are_unique_and_increment(client):
    first = await client.post(
        '/api/positions',
        json={
            'job_id': '',
            'role_title': 'Auto ID Role 1',
            'team': 'Team 27',
            'location': 'Lahore',
            'departure_type': 'Backfill',
            'status': 'Sourcing',
            'active_inactive': 'Active',
        },
    )
    second = await client.post(
        '/api/positions',
        json={
            'job_id': '',
            'role_title': 'Auto ID Role 2',
            'team': 'Team 27',
            'location': 'Lahore',
            'departure_type': 'Backfill',
            'status': 'Sourcing',
            'active_inactive': 'Active',
        },
    )
    assert first.status_code == 201
    assert second.status_code == 201

    first_id = first.json()['data']['job_id']
    second_id = second.json()['data']['job_id']
    assert first_id != second_id
    assert _suffix(second_id) == _suffix(first_id) + 1
