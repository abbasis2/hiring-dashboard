import { create } from "zustand";

import type { DashboardStats, Job, OutstandingRole } from "../types";

type LoadingState = {
  positions: boolean;
  jobs: boolean;
  stats: boolean;
};

type JobStore = {
  positions: OutstandingRole[];
  jobs: Job[];
  stats: DashboardStats | null;
  loading: LoadingState;
  error: string | null;
  setPositions: (positions: OutstandingRole[]) => void;
  setJobs: (jobs: Job[]) => void;
  setStats: (stats: DashboardStats | null) => void;
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setError: (message: string | null) => void;
  appendJob: (job: Job) => void;
};

const initialLoading: LoadingState = {
  positions: false,
  jobs: false,
  stats: false
};

export const useJobStore = create<JobStore>((set) => ({
  positions: [],
  jobs: [],
  stats: null,
  loading: initialLoading,
  error: null,
  setPositions: (positions) => set({ positions }),
  setJobs: (jobs) => set({ jobs }),
  setStats: (stats) => set({ stats }),
  setLoading: (key, value) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: value
      }
    })),
  setError: (message) => set({ error: message }),
  appendJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] }))
}));
