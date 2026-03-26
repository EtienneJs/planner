import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <DashboardOverview
      email={session?.user?.email}
      userId={session?.user?.id}
    />
  );
}
