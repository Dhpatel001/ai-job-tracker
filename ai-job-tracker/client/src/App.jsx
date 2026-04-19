import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import ToastContainer from "./components/ui/Toast.jsx";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
