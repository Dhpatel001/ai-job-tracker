import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddJob from "./pages/AddJob.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import ResumeSearch from "./pages/ResumeSearch.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
  },
  {
    path: "/add",
    element: (
      <Layout>
        <AddJob />
      </Layout>
    ),
  },
  {
    path: "/job/:id",
    element: (
      <Layout>
        <JobDetail />
      </Layout>
    ),
  },
  {
    path: "/resume-search",
    element: (
      <Layout>
        <ResumeSearch />
      </Layout>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <NotFound />
      </Layout>
    ),
  },
]);

export default router;
