"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetAllIssue } from "@/lib/hooks/use-get-all-issue";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useSearchParams } from "next/navigation";
import { Issue } from "@/utils/types";
import CornerLayout from "./CornerLayout";
import WalletConnectSection from "./WalletConnectSection";
import IssuesList from "./IssuesList";
import SearchFilterSection from "./SearchFilterSection";
import Pagination from "./Pagination";
import { formatTokenAmount } from "@/utils/format";

interface FilterOptions {
  difficulty: string;
  bountyRange: string;
  status: string;
}

export default function ExploreIssues() {
  const { allIssue = [], isFetchingData } = useGetAllIssue() as {
    allIssue: Issue[];
    isFetchingData: boolean;
  };
  const { address } = useWallet();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: "",
    bountyRange: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = allIssue;

    filtered = filtered.filter(issue => {
      return new Date(Number(issue.deadline) * 1000) > new Date();
    });

    if (searchQuery) {
      filtered = filtered.filter(issue => 
        issue.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.bountyRange) {
      filtered = filtered.filter(issue => {
        const bountyAmount = parseFloat(formatTokenAmount(issue.bountyAmount?.toString() || "0"));
        switch (filters.bountyRange) {
          case "0-50":
            return bountyAmount >= 0 && bountyAmount <= 50;
          case "50-100":
            return bountyAmount > 50 && bountyAmount <= 100;
          case "100-500":
            return bountyAmount > 100 && bountyAmount <= 500;
          case "500+":
            return bountyAmount > 500;
          default:
            return true;
        }
      });
    }

    if (filters.status) {
      filtered = filtered.filter(issue => {
        switch (filters.status) {
          case "open":
            return new Date(Number(issue.deadline) * 1000) > new Date();
          case "in-progress":
            return true; 
          case "completed":
            return new Date(Number(issue.deadline) * 1000) <= new Date();
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      const bountyA = Number(a.bountyAmount);
      const bountyB = Number(b.bountyAmount);
      const deadlineA = Number(a.deadline);
      const deadlineB = Number(b.deadline);
      
      if (bountyA !== bountyB) {
        return bountyB - bountyA;
      }
      
      return deadlineB - deadlineA;
    });

    return filtered;
  }, [allIssue, searchQuery, filters]);

  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedIssues.slice(startIndex, endIndex);
  }, [filteredAndSortedIssues, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedIssues.length / itemsPerPage);

  const highestRewardAmount = useMemo(() => {
    if (filteredAndSortedIssues.length === 0) return BigInt(0);
    return filteredAndSortedIssues[0]?.bountyAmount || BigInt(0);
  }, [filteredAndSortedIssues]);

  React.useEffect(() => {
    if (code) {
      sessionStorage.setItem("code", code);
      sessionStorage.setItem("code_timestamp", Date.now().toString());
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [code]);

  if (!address) {
    return (
      <CornerLayout>
        <WalletConnectSection />
      </CornerLayout>
    );
  }

  return (
    <CornerLayout>
      <div className="bg-white overflow-hidden">
        <div className="relative h-[100px] md:h-[200px]">
          <Image
            src="/images/Background/bg-explore-bounty.png"
            alt="Explore Issues Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <main className="px-8 py-12 bg-gray-50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Bounty Issues</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover open source projects that need your expertise. Contribute to meaningful projects and earn rewards for your valuable contributions.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <SearchFilterSection
              onSearch={setSearchQuery}
              onFilterChange={setFilters}
              totalIssues={filteredAndSortedIssues.length}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <IssuesList 
                allIssue={paginatedIssues} 
                isFetchingData={isFetchingData}
                highestRewardAmount={highestRewardAmount}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </CornerLayout>
  );
}