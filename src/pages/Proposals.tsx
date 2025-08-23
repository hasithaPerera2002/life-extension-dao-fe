import React from "react";
import { Layout } from "@/components/layout/Layout";
import { ProposalOverview } from "@/components/proposals/ProposalOverview";
import { MemberGuard } from "@/components/membership/MemberGuard";
import { NetworkAnimation } from "@/components/animations/NetworkAnimation";

const Proposals = () => {
  return (
    <Layout>
      <div className="absolute inset-0 opacity-80 pointer-events-none overflow-hidden z-0 bg-dao-dark/500">
        <NetworkAnimation />
      </div>
      <div className="space-y-6 z-10 relative ">
        <div className="flex z-10 items-center justify-between">
          <h1 className="text-4xl z-10 font-bold tracking-tight gradient-text">
            Proposals
          </h1>
          <div className="text-sm bg-dao-dark-accent/40 z-10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-dao-primary">Explore</span> /{" "}
            <span>Proposals</span>
          </div>
        </div>
        <MemberGuard>
          <ProposalOverview />
        </MemberGuard>
      </div>
    </Layout>
  );
};

export default Proposals;
