import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-2xl mx-auto card-premium p-8 text-center">
        <p className="text-sm font-medium text-slate-400 mb-2">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-6">
          That page does not exist in this tracker.
        </p>
        <Link
          to="/"
          className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
