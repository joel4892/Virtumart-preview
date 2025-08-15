import Link from 'next/link';

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <div className="space-x-2 text-sm">
          <Link className="underline" href="/auth/login">Login</Link>
          <Link className="underline" href="/auth/signup">Sign Up</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-neutral-800 rounded p-4">
          <h3 className="font-medium mb-2">Get Started</h3>
          <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
            <li>Sign up or log in</li>
            <li>Create a project in Admin → Projects</li>
            <li>Upload a dataset</li>
            <li>Annotate and run compliance</li>
            <li>Export data</li>
          </ul>
        </div>
        <div className="border border-neutral-800 rounded p-4">
          <h3 className="font-medium mb-2">Progress</h3>
          <div className="text-sm text-neutral-400">Datasets flow: ingestion → annotation → compliance → export</div>
        </div>
      </div>
    </div>
  );
}