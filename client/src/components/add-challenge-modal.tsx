import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Waves, 
  Mountain, 
  IceCream, 
  Camera, 
  Music, 
  Star 
} from "lucide-react";

const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  points: z.number().min(1, "Points must be at least 1").max(1000, "Points cannot exceed 1000"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  icon: z.string().min(1, "Please select an icon"),
});

type CreateChallengeData = z.infer<typeof createChallengeSchema>;

interface AddChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const icons = [
  { id: "swimmer", icon: Waves, label: "Swimming" },
  { id: "hiking", icon: Mountain, label: "Hiking" },
  { id: "ice-cream", icon: IceCream, label: "Food" },
  { id: "camera", icon: Camera, label: "Photo" },
  { id: "music", icon: Music, label: "Music" },
  { id: "star", icon: Star, label: "General" },
];

export default function AddChallengeModal({ isOpen, onClose, onSuccess }: AddChallengeModalProps) {
  const [selectedIcon, setSelectedIcon] = useState("");
  const { toast } = useToast();

  const form = useForm<CreateChallengeData>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      points: 50,
      difficulty: "easy",
      icon: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateChallengeData) => {
      const response = await apiRequest("POST", "/api/challenges", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge created!",
        description: "Your new challenge has been added to the group.",
      });
      form.reset();
      setSelectedIcon("");
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create challenge",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateChallengeData) => {
    createMutation.mutate(data);
  };

  const handleIconSelect = (iconId: string) => {
    setSelectedIcon(iconId);
    form.setValue("icon", iconId);
  };

  const handleClose = () => {
    form.reset();
    setSelectedIcon("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Create New Challenge
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter challenge name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the challenge..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="1000" 
                        placeholder="50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={() => (
                <FormItem>
                  <FormLabel>Category Icon</FormLabel>
                  <div className="grid grid-cols-6 gap-2">
                    {icons.map(({ id, icon: IconComponent, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleIconSelect(id)}
                        className={`p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors ${
                          selectedIcon === id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300"
                        }`}
                        title={label}
                      >
                        <IconComponent className="w-5 h-5 text-gray-600 mx-auto" />
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Challenge"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
