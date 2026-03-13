import { render, screen } from '@testing-library/react';

import { DEFAULT_DROPDOWN_OPTIONS } from '../constants';
import PositionTable from '../components/PositionTable';

describe('PositionTable', () => {
  it('renders workbook field headers', () => {
    render(
      <PositionTable
        options={DEFAULT_DROPDOWN_OPTIONS}
        roles={[
          {
            id: 1,
            job_id: 'JOB-001',
            role_title: 'Senior Database Engineer',
            link_to_jd: 'https://example.com',
            team: 'Team D',
            location: 'Lahore',
            backfill_reason: 'Backfill',
            departure_type: 'Backfill',
            candidate_gender: 'Male',
            start_date: '',
            status: 'Sourcing',
            internal_shortlisted: 4,
            interviews_completed: 4,
            interviews_pending: 0,
            date_filled: '',
            active_inactive: 'Active',
            reason_why_next_steps: 'Continue interviews next week.',
            created_at: '2026-03-11',
            updated_at: '2026-03-11'
          }
        ]}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText('Job ID')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Senior Database Engineer')).toBeInTheDocument();
  });
});
