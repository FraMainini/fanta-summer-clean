import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Waves, 
  Mountain, 
  IceCream, 
  Camera, 
  Music, 
  Star, 
  Check 
} from "lucide-react";

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

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: () => void;
}

const iconMap = {
  swimmer: Waves,
  hiking: Mountain,
  "ice-cream": IceCream,
  camera: Camera,
  music: Music,
  star: Star,
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const gradientClasses = {
  easy: "from-green-50 to-emerald-50 border-green-200",
  medium: "from-yellow-50 to-orange-50 border-yellow-200",
  hard: "from-red-50 to-pink-50 border-red-200",
};

export default function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const IconComponent = iconMap[challenge.icon as keyof typeof iconMap] || Star;

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/challenges/${challenge.id}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Challenge completed! 🎉",
        description: `You earned ${data.points} points!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to complete challenge",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (challenge.isCompleted || isCompleting) return;
    
    setIsCompleting(true);
    try {
      await completeMutation.mutateAsync();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div 
      className={`challenge-card bg-gradient-to-r ${gradientClasses[challenge.difficulty as keyof typeof gradientClasses]} border rounded-xl p-4 hover:shadow-lg cursor-pointer transition-all duration-300 ${
        challenge.isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
              <IconComponent className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
              <p className="text-sm text-gray-600">+{challenge.points} points</p>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mb-3">{challenge.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge 
                className={`text-xs font-medium ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}
              >
                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
              </Badge>
              <span className="text-xs text-gray-500">
                Completed by {challenge.completedCount} people
              </span>
            </div>
            
            {challenge.isCompleted ? (
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Completed
              </div>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium"
                size="sm"
              >
                {isCompleting ? (
                  "Completing..."
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Mark Done
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
