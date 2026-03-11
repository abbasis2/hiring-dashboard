import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AddJob from "../pages/AddJob";

vi.mock("../api/client", () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 10,
          job_id: "JOB-010",
          role_title: "Recruiter",
          link_to_jd: "",
          team: "Team D",
          location: "CN/Lahore",
          backfill_reason: "",
          departure_type: "Backfill",
          start_date: "",
          status: "Sourcing",
          internal_shortlisted: null,
          interviews_completed: null,
          interviews_pending: null,
          date_filled: "",
          active_inactive: "Active",
          created_at: "2026-03-10T00:00:00",
          updated_at: "2026-03-10T00:00:00"
        },
        meta: { total: 1, page: 1 }
      }
    })
  }
}));

describe("AddJob", () => {
  it("renders the heading", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <AddJob />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText("Add Position")).toBeInTheDocument();
  });
});
