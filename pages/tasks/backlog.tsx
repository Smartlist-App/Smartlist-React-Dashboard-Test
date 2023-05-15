import { Backlog } from "@/components/Boards/Backlog";
import { TasksLayout } from "@/components/Boards/Layout";
import { useState } from "react";

/**
 * Top-level component for the dashboard page.
 */
export default function Dashboard() {
  const [open, setOpen] = useState(false);

  return (
    <TasksLayout open={open} setOpen={setOpen}>
      <Backlog setDrawerOpen={() => setOpen(true)} />
    </TasksLayout>
  );
}
