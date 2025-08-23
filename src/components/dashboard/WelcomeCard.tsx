
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet/useWallet";

export function WelcomeCard() {
  const { connect, isConnected, memberStatus } = useWallet();

  // Don't show welcome card if user is already connected and is a member
  if (isConnected && memberStatus.isMember) {
    return null;
  }

  return (
    <Card className="glass-card overflow-hidden backdrop-blur-md bg-white/10 shadow-lg">
      <CardHeader className="bg-dao-dark-accent/50 border-b border-white/10 backdrop-blur-sm">
        <CardTitle className="text-2xl gradient-text">
          Welcome to InsuraX
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <p className="text-foreground/80">
            Become a member of our Decentralized Autonomous Organization and
            participate in governance, proposals, and access exclusive insurance
            benefits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              className="glass-card-secondary"
              title="Governance"
              description="Vote on proposals and help shape the future of the organization"
              iconBg="bg-dao-primary/20"
              iconText="🗳️"
            />

            <FeatureCard
              className="glass-card-secondary"
              title="Insurance"
              description="Access exclusive protection plans backed by the treasury"
              iconBg="bg-dao-tertiary/20"
              iconText="🛡️"
            />

            <FeatureCard
              className="glass-card-secondary"
              title="Rewards"
              description="Earn incentives for active participation in the DAO"
              iconBg="bg-dao-secondary/20"
              iconText="💎"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-dao-dark-accent/30 border-t border-white/10 p-6 backdrop-blur-sm">
        {!isConnected ? (
          <Button
            onClick={connect}
            className="w-full bg-gradient-to-r from-dao-primary to-dao-tertiary text-black font-medium hover:opacity-90"
            size="lg"
          >
            Connect Wallet to Begin
          </Button>
        ) : (
          <Button
            onClick={() => window.location.href = '/membership'}
            className="w-full bg-gradient-to-r from-dao-primary to-dao-tertiary text-black font-medium hover:opacity-90"
            size="lg"
          >
            Join DAO to Access Features
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function FeatureCard({
  title,
  description,
  iconBg,
  iconText,
  className = "",
}: {
  title: string;
  description: string;
  iconBg: string;
  iconText: string;
  className?: string;
}) {
  return (
    <div
      className={`b p-4 rounded-lg border border-white/10 hover:border-white/20   ${className}`}
    >
      <div
        className={`w-10 h-10  rounded-full flex items-center justify-center mb-3`}
      >
        <span className="text-xl">{iconText}</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-foreground/70">{description}</p>
    </div>
  );
}
