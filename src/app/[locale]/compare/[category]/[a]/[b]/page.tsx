import { notFound } from "next/navigation";
import {
  getAllAlgorithms,
  getAllSearches,
  getAllGraphs,
  getAllPatterns,
  getAllStructures,
  getContent,
} from "@codeprism/content";
import CompareClient from "./compare-client";

const validCategories = ["algorithm", "search", "graph", "pattern", "structure"];

export async function generateStaticParams() {
  const algorithmSlugs = getAllAlgorithms().map((a) => a.slug);
  const searchSlugs = getAllSearches().map((s) => s.slug);
  const graphSlugs = getAllGraphs().map((g) => g.slug);
  const patternSlugs = getAllPatterns().map((p) => p.slug);
  const structureSlugs = getAllStructures().map((s) => s.slug);

  const params: { category: string; a: string; b: string }[] = [];

  // Generate all unique pairs for each category
  for (const [category, slugs] of [
    ["algorithm", algorithmSlugs],
    ["search", searchSlugs],
    ["graph", graphSlugs],
    ["pattern", patternSlugs],
    ["structure", structureSlugs],
  ] as const) {
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        params.push({ category, a: slugs[i], b: slugs[j] });
      }
    }
  }

  return params;
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ category: string; a: string; b: string }>;
}) {
  const { category, a, b } = await params;

  if (!validCategories.includes(category)) notFound();

  const contentA = getContent(category, a);
  const contentB = getContent(category, b);

  if (!contentA || !contentB) notFound();

  return (
    <CompareClient
      category={category}
      a={a}
      b={b}
    />
  );
}
