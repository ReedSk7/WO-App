import type { Metadata } from "next";
import { HomeScreen } from "./components/HomeScreen";

export const metadata: Metadata = {
  title: "Work Order Readiness",
  description:
    "Check a synthetic demonstration work order for blockers, required review, pending work, and day-of actions.",
};

export default function Home() {
  return <HomeScreen />;
}
