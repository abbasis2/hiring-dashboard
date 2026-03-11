from __future__ import annotations

from backend.excel_parser import parse_excel_workbook


async def test_parse_excel_returns_both_tabs(workbook_bytes):
    rows = parse_excel_workbook(workbook_bytes)
    assert len(rows['outstanding_roles']) == 1
    assert rows['filled_roles'] == []


async def test_upload_excel_endpoint_imports_positions(client, workbook_bytes):
    response = await client.post(
        '/api/upload-excel',
        files={'file': ('positions.xlsx', workbook_bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},
    )
    assert response.status_code == 201
    assert response.json()['data']['imported_outstanding'] == 1
