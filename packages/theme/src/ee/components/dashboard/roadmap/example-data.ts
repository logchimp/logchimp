import type { components } from "@logchimp/api-ts-types";

export const EXAMPLE_ROADMAPS_DATA: Array<
  components["schemas"]["RoadmapPrivate"]
> = [
  {
    id: "1",
    name: "Backlog",
    color: "efefef",
    display: true,
    index: 0,
    url: "backlog",
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Under review",
    color: "abcefa",
    display: true,
    url: "under-review",
    index: 1,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "In Progress",
    color: "eecefa",
    display: true,
    url: "in-progress",
    index: 2,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Completed",
    color: "afecee",
    display: true,
    url: "completed",
    index: 3,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
];
