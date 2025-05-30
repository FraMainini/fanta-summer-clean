import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sun, Plus, UserPlus, LogOut, Crown } from "lucide-react";
import ChallengeCard from "@/components/challenge-card";
import Leaderboard from "@/components/leaderboard";
import AddChallengeModal from "@/components/add-challenge-modal";
import InviteModal from "@/components/invite-modal";

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  difficulty: string;
  icon: string;
  isCompleted: boolean;
  completedCount: number;
}

interface Stats {
  totalChallenges: number;
  activeMembers: number;
  completedToday: number;
  averageScore: number;
  groupScore: number;
}

export default function Dashboard() {
  const { user, group, logout } = useAuth();
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const { data: challenges = [], refetch: refetchChallenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const filteredChallenges = challenges.filter((challenge) => {
    if (filter === "completed") return challenge.isCompleted;
    if (filter === "pending") return !challenge.isCompleted;
    return true;
  });

  const userRank = leaderboard.findIndex((u: any) => u.id === user?.id) + 1;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-orange-100">
      {/* Navigation Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sun className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{group?.name}</h1>
                <p className="text-sm text-gray-600">{stats?.activeMembers} members</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{user?.points}</div>
                  <div className="text-xs text-gray-600">Your Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">#{userRank || "-"}</div>
                  <div className="text-xs text-gray-600">Your Rank</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
            <p className="text-gray-600">Track your summer challenges and compete with friends!</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowAddChallenge(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Challenge
            </Button>
            
            <Button
              onClick={() => setShowInvite(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenges Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Active Challenges</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className={filter === "all" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : ""}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("pending")}
                    className={filter === "pending" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : ""}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("completed")}
                    className={filter === "completed" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : ""}
                  >
                    Completed
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredChallenges.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">No challenges found</div>
                    <p className="text-gray-600">
                      {filter === "all" 
                        ? "Start by creating your first challenge!" 
                        : `No ${filter} challenges at the moment.`}
                    </p>
                  </div>
                ) : (
                  filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onComplete={() => refetchChallenges()}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Leaderboard users={leaderboard} currentUserId={user?.id} />

            {/* Group Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Group Stats</h3>
                <Crown className="text-orange-500 text-xl" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Challenges</span>
                  <span className="font-bold text-gray-800">{stats?.totalChallenges || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Members</span>
                  <span className="font-bold text-gray-800">{stats?.activeMembers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Today</span>
                  <span className="font-bold text-gray-800">{stats?.completedToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-bold text-gray-800">{stats?.averageScore || 0}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {stats?.groupScore || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Group Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddChallengeModal
        isOpen={showAddChallenge}
        onClose={() => setShowAddChallenge(false)}
        onSuccess={() => {
          refetchChallenges();
          setShowAddChallenge(false);
        }}
      />

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        inviteCode={group?.inviteCode || ""}
      />
    </div>
  );
}
