/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { DashboardView } from "./components/DashboardView";
import { VerifyCertificateView } from "./components/VerifyCertificateView";
import { IssueCertificateView } from "./components/IssueCertificateView";
import { BlockchainExplorerView } from "./components/BlockchainExplorerView";
import { GenesisBlockView } from "./components/GenesisBlockView";
import { TamperLabView } from "./components/TamperLabView";
import { CertificatesListView } from "./components/CertificatesListView";
import { OrganizationsView } from "./components/OrganizationsView";
import { ArchitectureView } from "./components/ArchitectureView";
import { Stats, ActivityEvent, VerificationLogItem, Block } from "./types";
import { fetchStats, fetchActivities, fetchVerificationLogs, seedDemoData } from "./lib/api";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLogItem[]>([]);
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Navigation query parameters between tabs
  const [verifyQuery, setVerifyQuery] = useState<string>("");
  const [explorerBlockIndex, setExplorerBlockIndex] = useState<number | undefined>(undefined);
  const [tamperCertId, setTamperCertId] = useState<string>("");

  const refreshGlobalData = async () => {
    try {
      const [s, a, l] = await Promise.all([
        fetchStats(),
        fetchActivities(),
        fetchVerificationLogs(),
      ]);
      setStats(s);
      setActivities(a);
      setVerificationLogs(l);
    } catch (err) {
      console.error("Error refreshing global data:", err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
    // Periodic light polling every 12 seconds to keep live metrics updated
    const interval = setInterval(refreshGlobalData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    try {
      await seedDemoData();
      await refreshGlobalData();
    } catch (err) {
      console.error("Error loading demo data:", err);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleNavigate = (tab: string, query?: string) => {
    if (tab === "verify" && query) {
      setVerifyQuery(query);
    }
    if (tab === "explorer" && query) {
      setExplorerBlockIndex(Number(query));
    }
    if (tab === "tamper" && query) {
      setTamperCertId(query);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCertificateIssued = (newBlock: Block) => {
    refreshGlobalData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === "verify") setVerifyQuery("");
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        stats={stats}
        onLoadDemoData={handleLoadDemoData}
        loadingDemo={loadingDemo}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === "dashboard" && (
          <DashboardView
            stats={stats}
            activities={activities}
            verificationLogs={verificationLogs}
            onNavigate={handleNavigate}
            onLoadDemoData={handleLoadDemoData}
            loadingDemo={loadingDemo}
          />
        )}

        {currentTab === "verify" && (
          <VerifyCertificateView
            initialQuery={verifyQuery}
            onNavigateToExplorer={(blockIdx) => {
              setExplorerBlockIndex(blockIdx);
              setCurrentTab("explorer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNavigateToTamper={(certId) => {
              setTamperCertId(certId || "");
              setCurrentTab("tamper");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentTab === "issue" && (
          <IssueCertificateView
            onSuccess={handleCertificateIssued}
            onNavigateToVerify={(certId) => {
              setVerifyQuery(certId);
              setCurrentTab("verify");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNavigateToExplorer={(blockIdx) => {
              setExplorerBlockIndex(blockIdx);
              setCurrentTab("explorer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentTab === "history" && (
          <CertificatesListView
            onNavigateToVerify={(certId) => {
              setVerifyQuery(certId);
              setCurrentTab("verify");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNavigateToExplorer={(blockIdx) => {
              setExplorerBlockIndex(blockIdx);
              setCurrentTab("explorer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentTab === "explorer" && (
          <BlockchainExplorerView
            initialSelectedBlockIndex={explorerBlockIndex}
            onNavigateToGenesis={() => {
              setCurrentTab("genesis");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNavigateToTamper={(certId) => {
              setTamperCertId(certId);
              setCurrentTab("tamper");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentTab === "genesis" && <GenesisBlockView />}

        {currentTab === "tamper" && (
          <TamperLabView
            initialCertificateId={tamperCertId}
            onNavigateToVerify={(certId) => {
              setVerifyQuery(certId);
              setCurrentTab("verify");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentTab === "organizations" && (
          <OrganizationsView
            onNavigateToVerify={(certId) => {
              setVerifyQuery(certId);
              setCurrentTab("verify");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNavigateToExplorer={(blockIdx) => {
              setExplorerBlockIndex(blockIdx);
              setCurrentTab("explorer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentTab === "architecture" && <ArchitectureView />}
      </main>

      {/* Global Academic Disclaimer Footer */}
      <Footer onSelectTab={(tab) => setCurrentTab(tab)} />
    </div>
  );
}
