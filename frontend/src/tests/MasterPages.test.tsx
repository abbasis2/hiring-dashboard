import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import MasterFieldPage from "../pages/master/MasterFieldPage";
import MasterPagesIndex from "../pages/master/MasterPagesIndex";

vi.mock("../api/client", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: {
          team: [{ id: 1, field_key: "team", value: "Team D", sort_order: 0, is_active: true }],
          location: [{ id: 2, field_key: "location", value: "CN/Lahore", sort_order: 0, is_active: true }],
          departure_type: [{ id: 3, field_key: "departure_type", value: "Backfill", sort_order: 0, is_active: true }],
          outstanding_status: [{ id: 4, field_key: "outstanding_status", value: "Sourcing", sort_order: 0, is_active: true }],
          active_inactive: [{ id: 5, field_key: "active_inactive", value: "Active", sort_order: 0, is_active: true }],
          filled_status: [{ id: 6, field_key: "filled_status", value: "Started", sort_order: 0, is_active: true }],
        },
        meta: { total: 6, page: 1 },
      },
    }),
    post: vi.fn().mockResolvedValue({
      data: {
        data: { id: 7, field_key: "team", value: "Team Z", sort_order: 7, is_active: true },
        meta: { total: 1, page: 1 },
      },
    }),
  },
}));

function renderWithProviders(route: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<MasterPagesIndex />} path="/master-pages" />
          <Route element={<MasterFieldPage />} path="/master-pages/:fieldKey" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Master Pages", () => {
  it("renders master pages index", async () => {
    renderWithProviders("/master-pages");
    expect(await screen.findByText("Master Pages")).toBeInTheDocument();
  });

  it("handles invalid field route without crashing", async () => {
    renderWithProviders("/master-pages/unknown-field");
    expect(await screen.findByText("Master Page Not Found")).toBeInTheDocument();
  });
});
