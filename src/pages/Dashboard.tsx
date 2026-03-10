import React from "react";
import { db } from "@/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import GreetingHero from "../components/dashboard/GreetingHero";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentEntries from "../components/dashboard/RecentEntries";
import EmptyState from "../components/dashboard/EmptyState";
import MoodChart from "../components/dashboard/MoodChart";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "journal_entries"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Dashboard fetch error", error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <GreetingHero userName={user?.displayName} />
      <StatsGrid entries={entries} />

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <RecentEntries entries={entries} />
          </div>
          <div>
            <MoodChart entries={entries} />
          </div>
        </div>
      )}
    </div>
  );
}
