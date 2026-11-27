import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-700">
              ROUTESYNC
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              Welcome, {session.user.name}
            </h1>
            <p className="mt-2 text-slate-500">
              Your delivery operations workspace is ready.
            </p>
          </div>

          <SignOutButton />
        </div>

        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Authentication successful
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            You're signed in to RouteSync.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Signed in as: {session.user.email}
          </p>
        </section>
      </div>
    </main>
  );
}