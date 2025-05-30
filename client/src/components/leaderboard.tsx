import { Trophy, Crown } from "lucide-react";

interface User {
  id: number;
  username: string;
  points: number;
}

interface LeaderboardProps {
  users: User[];
  currentUserId?: number;
}

export default function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-orange-50 to-pink-50 border-orange-200";
      case 2:
        return "from-blue-50 to-orange-50 border-blue-200";
      case 3:
        return "from-green-50 to-blue-50 border-green-200";
      default:
        return "hover:bg-gray-50";
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-orange-500 to-pink-500";
      case 2:
        return "from-blue-500 to-orange-400";
      case 3:
        return "from-green-500 to-green-600";
      default:
        return "from-gray-300 to-gray-400";
    }
  };

  const getAvatarColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-orange-400 to-pink-500";
      case 2:
        return "from-blue-400 to-orange-400";
      case 3:
        return "from-pink-500 to-orange-400";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Leaderboard</h3>
        <Trophy className="text-orange-500 text-xl" />
      </div>
      
      <div className="space-y-3">
        {users.slice(0, 10).map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.id === currentUserId;
          
          return (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-3 bg-gradient-to-r ${getRankGradient(rank)} rounded-xl border transition-colors ${
                isCurrentUser ? "ring-2 ring-orange-300" : ""
              }`}
            >
              <div className={`w-8 h-8 bg-gradient-to-r ${getRankBadgeColor(rank)} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{rank}</span>
              </div>
              
              <div className={`w-10 h-10 bg-gradient-to-r ${getAvatarColor(rank)} rounded-full flex items-center justify-center`}>
                <span className="text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <div className={`font-semibold text-gray-800 ${isCurrentUser ? "text-orange-700" : ""}`}>
                  {user.username}
                  {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </div>
                <div className="text-sm text-gray-600">{user.points} points</div>
              </div>
              
              {rank === 1 && <Crown className="text-orange-500" size={20} />}
              {isCurrentUser && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No participants yet</p>
          </div>
        )}
      </div>
      
      {users.length > 10 && (
        <button className="w-full mt-4 text-center text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
          View Full Leaderboard
        </button>
      )}
    </div>
  );
}
