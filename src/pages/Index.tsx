
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BackgroundAnimation } from "@/components/animations/BackgroundAnimation";
import { NetworkAnimation } from "@/components/animations/NetworkAnimation";

// Dashboard is accessible to all users, members and non-members
const Index = () => {
  return (
    <Layout>
      <div className="relative">
        
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <NetworkAnimation />
        </div>
        
        {/* Main content layer */}
        <div className="relative z-10">
          <Dashboard />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
