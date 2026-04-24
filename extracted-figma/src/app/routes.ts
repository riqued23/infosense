import { createBrowserRouter } from "react-router";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { Results } from "./components/Results";
import { ClinicalNoteResults } from "./components/ClinicalNoteResults";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Onboarding,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/results",
    Component: Results,
  },
  {
    path: "/clinical-note",
    Component: ClinicalNoteResults,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);