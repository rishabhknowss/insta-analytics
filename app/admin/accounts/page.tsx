import { headers } from "next/headers";

type AccountRow = {
  id: string;
  username: string | null;
  reelCount: number;
  createdAt: string;
  lastSeenAt: string;
  yesterday: { views: number; likes: number; comments: number };
};

async function getAccounts(): Promise<AccountRow[]> {
  const headerStore = await headers();
  const auth = headerStore.get("authorization") ?? "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/accounts`,
    {
      cache: "no-store",
      headers: {
        "x-admin-secret": process.env.ADMIN_SECRET ?? "",
        authorization: auth,
      },
    },
  );
  if (!res.ok) throw new Error("Failed to load accounts");
  return res.json();
}

export default async function AccountsPage() {
  let accounts: AccountRow[] = [];
  let error: string | null = null;

  try {
    accounts = await getAccounts();
  } catch {
    error = "Could not load accounts.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          All connected Instagram accounts.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No accounts yet. Ask users to connect their Instagram account.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
                  Account
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Reels
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Views (yesterday)
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Likes (yesterday)
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Comments (yesterday)
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Last seen
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3">
                    <a
                      href={`/admin/accounts/${account.id}`}
                      className="font-medium text-black hover:underline dark:text-white"
                    >
                      {account.username ?? account.id}
                    </a>
                    {account.username && (
                      <p className="text-xs text-zinc-400">{account.id}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                    {account.reelCount}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                    {account.yesterday.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                    {account.yesterday.likes.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                    {account.yesterday.comments.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-zinc-400">
                    {new Date(account.lastSeenAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
