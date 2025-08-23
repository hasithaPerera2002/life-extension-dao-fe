import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/components/wallet/useWallet";
import { MembershipSummary } from "@/components/membership/MembershipSummary";
import { ProposalOverview } from "@/components/proposals/ProposalOverview";
import { WelcomeCard } from "./WelcomeCard";
import { InsuranceBotAnimation } from "@/components/animations/InsuranceBotAnimation";
import { useContract } from "../contract/useContract";
import { MemberGuard } from "@/components/membership/MemberGuard";
import { handleContractCall } from "@/lib/contractUtils";

export function Dashboard() {
  const { isConnected } = useWallet();
  const [totalMembers, setTotalMembers] = useState(0);
  const [activePolicies, setActivePolicies] = useState(0);
  const { contracts } = useContract();

  useEffect(() => {
    getTotalMembers();
    getActivePolicies();
  }, []);
  useEffect(() => {
    getTotalMembers();
    getActivePolicies();
  }, [contracts.membersContract, isConnected, contracts.proposalContract]);

  async function getTotalMembers() {
    console.log("contracts", contracts);

    if (contracts.membersContract) {
      console.log("contracts.membersContract", contracts.membersContract);

      try {
        await handleContractCall({
          fn: async () => {
            return contracts.membersContract.getActiveMemberCount();
          },
          abi: [],
          onSuccess: (members) => {
            console.log("members", members);
            setTotalMembers(members);
          }
        });
      } catch (error) {
        console.error("Error fetching total members:", error);
      }
    }
  }

  async function getActivePolicies() {
    if (contracts.proposalContract) {
      try {
        await handleContractCall({
          fn: async () => {
            const policies = await contracts.proposalContract.getProposalsByStatus(0); // pending 0
            const proposalCount = await contracts.proposalContract.getProposalCount();
            return { policies, proposalCount };
          },
          abi: [],
          onSuccess: ({ policies, proposalCount }) => {
            console.log("proposal count", proposalCount);
            console.log("active policies", policies);
            setActivePolicies(policies.length);
          }
        });
      } catch (error) {
        console.error("Error fetching active policies:", error);
      }
    }
  }

  // Define user subscribed insurances for the dashboard
  const userInsurancePolicies = [
    { id: "POL-001", name: "Basic Coverage", active: true },
    { id: "POL-002", name: "Premium Protection", active: true },
  ];

  return (
    <div className="space-y-6 overflow-hidden  relative p-6 rounded-lg ">
      <div className="flex items-center justify-between ">
        <h1 className="text-4xl font-bold tracking-tight gradient-text">
          Dashboards
        </h1>
        <div className="text-sm bg-dao-dark-accent/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="text-dao-primary">Explore</span> /{" "}
          <span>Dashboards</span>
        </div>
      </div>

      {!isConnected ? (
        <WelcomeCard />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6">
            {/* DAO Stats Cards */}
            <StatCard
              title="Total Members"
              value={totalMembers.toString()}
              change="+12% 🔼"
              description="Active participants"
              color="from-dao-primary/20 to-transparent"
            />
            <StatCard
              title="Treasury"
              value="124.5 ETH"
              change="+3.2 ETH 🔼"
              description="Total funds"
              color=""
            />
            <StatCard
              title="Active Proposals"
              value={activePolicies.toString()}
              change="3 closing soon ⚠️"
              description="Needs your vote"
              color=""
            />
            <StatCard
              title="Insurance Claims"
              value="12"
              change="-3% 🔽"
              description="Pending review"
              color=""
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Membership Status */}
            <Card className="neo-glass border-white/10 overflow-hidden">
              <CardHeader className="bg-dao-dark-accent/30 border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  Membership Status
                </CardTitle>
                <CardDescription>Your current DAO standing</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <MembershipSummary />
              </CardContent>
            </Card>

            {/* Insurance Highlights */}
            <Card className="neo-glass border-white/10 overflow-hidden">
              <CardHeader className="bg-dao-dark-accent/30 border-b border-white/10">
                <CardTitle className="text-xl">Insurance Coverage</CardTitle>
                <CardDescription>Your active policies</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="mb-4">
                  <InsuranceBotAnimation />
                </div>
                <div className="p-4 space-y-2">
                  {userInsurancePolicies.length > 0 ? (
                    <>
                      {userInsurancePolicies.map((policy) => (
                        <div
                          key={policy.id}
                          className="p-3 bg-dao-dark rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {policy.name}
                            </p>
                            <p className="text-xs text-foreground/70">
                              ID: {policy.id}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              policy.active
                                ? "bg-dao-primary/20 text-dao-primary"
                                : "bg-foreground/10 text-foreground/50"
                            }`}
                          >
                            {policy.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ))}
                      <div className="text-center pt-2">
                        <Button
                          variant="link"
                          className="text-sm text-foreground/70 hover:text-dao-primary"
                          href="/membership"
                        >
                          View all policies →
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-foreground/70 mb-3">
                        No active insurance policies
                      </p>
                      <Button
                        size="sm"
                        className="bg-dao-primary text-black hover:bg-dao-primary/90"
                        href="/insurance"
                      >
                        Browse Plans
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Proposal Overview - wrapped with MemberGuard */}
            <Card className="neo-glass border-white/10 overflow-hidden h-full">
              <CardHeader className="bg-dao-dark-accent/30 border-b border-white/10">
                <CardTitle className="text-xl">Active Proposals</CardTitle>
                <CardDescription>Requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <MemberGuard>
                  <ProposalOverview key={`proposals-${Date.now()}`} />
                </MemberGuard>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// Helper component for stats cards
function StatCard({
  title,
  value,
  change,
  description,
  color,
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  color: string;
}) {
  return (
    <Card className="neo-glass border-white/10 overflow-hidden">
      <div
        className={`absolute inset-2 bg-gradient-to-br  from-sky-900/30 to-sky-600/30 opacity-20 rounded-xl`}
      />
      <CardContent className="p-6 relative z-10 card-hover">
        <div className="flex flex-col">
          <p className="text-sm text-foreground/70">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-dao-primary">
              {change}
            </span>
            <span className="text-xs text-foreground/50">{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for activity feed
function getActivityIcon(index: number) {
  const icons = ["💰", "🗳️", "🛡️", "🔄"];
  return icons[index % icons.length];
}

function getActivityTitle(index: number) {
  const titles = [
    'New proposal submitted: "Expand Insurance Coverage"',
    'You voted on "Treasury Allocation Plan"',
    "New insurance claim processed",
    "DAO membership increased by 15 members",
  ];
  return titles[index % titles.length];
}

function getActivityTime(index: number) {
  const times = ["3 hours ago", "1 day ago", "2 days ago", "just now"];
  return times[index % times.length];
}

// Helper Button component that supports href
function Button({
  children,
  className,
  variant = "default",
  size = "default",
  href,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: string;
  size?: string;
  href?: string;
  [key: string]: any;
}) {
  if (href) {
    return (
      <a href={href} className={`inline-block ${className}`} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
