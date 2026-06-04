import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getAllAlgorithms,
  getAllPatterns,
  getAllStructures,
  getAllSearches,
  getAllGraphs,
} from "@codeprism/content";
import VisualizerClient from "./visualizer-client";
import LoadingVisualizer from "../../loading";

export async function generateStaticParams() {
  const algorithms = getAllAlgorithms().map((a) => ({
    category: "algorithm",
    slug: a.slug,
  }));
  const patterns = getAllPatterns().map((p) => ({
    category: "pattern",
    slug: p.slug,
  }));
  const structures = getAllStructures().map((s) => ({
    category: "structure",
    slug: s.slug,
  }));
  const searches = getAllSearches().map((s) => ({
    category: "search",
    slug: s.slug,
  }));
  const graphs = getAllGraphs().map((g) => ({
    category: "graph",
    slug: g.slug,
  }));
  return [...algorithms, ...patterns, ...structures, ...searches, ...graphs];
}

const validCategories = ["algorithm", "pattern", "structure", "search", "graph"];

export default async function VisualizerPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  if (!validCategories.includes(category)) notFound();
  return (
    <div className="h-screen flex flex-col bg-bg-primary pt-16">
      <Suspense fallback={<LoadingVisualizer />}>
        <VisualizerClient category={category} slug={slug} />
      </Suspense>
    </div>
  );
}
