import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Sun, Users, Plus } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  groupCode: z.string().min(1, "Group code is required"),
});

const createGroupSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, createGroup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      groupCode: "",
    },
  });

  const createGroupForm = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      username: "",
      password: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password, data.groupCode);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into your group.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials or group code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateGroup = async (data: CreateGroupFormData) => {
    setIsLoading(true);
    try {
      const group = await createGroup(data.groupName);
      await login(data.username, data.password, group.inviteCode);
      toast({
        title: "Group created!",
        description: `Welcome to ${group.name}! Your invite code is ${group.inviteCode}`,
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to create group",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-blue-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Fanta Summer</h1>
          <p className="text-gray-600">Challenge Platform</p>
        </div>

        <Tabs defaultValue="join" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Join Group
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join a Group</CardTitle>
                <CardDescription>
                  Enter your details and group code to join an existing Fanta Summer group.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="groupCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter group invite code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Joining..." : "Join Group"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
                <CardDescription>
                  Start a new Fanta Summer challenge group and invite your friends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...createGroupForm}>
                  <form onSubmit={createGroupForm.handleSubmit(onCreateGroup)} className="space-y-4">
                    <FormField
                      control={createGroupForm.control}
                      name="groupName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Summer Squad 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createGroupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createGroupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Group"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
