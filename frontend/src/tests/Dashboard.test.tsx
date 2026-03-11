import { render, screen } from "@testing-library/react";

import KPICard from "../components/KPICard";

describe("KPICard", () => {
  it("renders title and subtitle", () => {
    render(<KPICard title="Total Positions" value={12} subtitle="Tracked roles" />);
    expect(screen.getByText("Total Positions")).toBeInTheDocument();
    expect(screen.getByText("Tracked roles")).toBeInTheDocument();
  });
});
