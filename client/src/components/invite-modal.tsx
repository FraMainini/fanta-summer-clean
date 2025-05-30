import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Copy, Mail } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
}

export default function InviteModal({ isOpen, onClose, inviteCode }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    try {
      // In a real app, this would send an email invitation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Invitation sent!",
        description: `Invite sent to ${email}`,
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Invite Friends
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Code Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Group Invite Code
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                value={inviteCode}
                readOnly
                className="flex-1 font-mono text-center bg-gray-100"
              />
              <Button
                onClick={copyToClipboard}
                size="icon"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Share this code with friends to join your group
            </p>
          </div>

          <Separator />

          {/* Email Invitation Section */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">
              Or send direct invites
            </h4>
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={isSending}
              >
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">How to join:</h5>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Share the invite code with your friends</li>
              <li>They create an account and enter the code</li>
              <li>Start competing in challenges together!</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
