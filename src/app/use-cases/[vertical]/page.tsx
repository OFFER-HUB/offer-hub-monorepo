import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UseCaseLayout } from "@/components/use-cases/UseCaseLayout";
import {
  USE_CASE_IDS,
  getUseCaseData,
  isUseCaseId,
} from "@/components/use-cases/data";
import { buildPageMetadata } from "@/lib/seo";

interface UseCasePageProps {
  params: Promise<{ vertical: string }>;
}

export function generateStaticParams() {
  return USE_CASE_IDS.map((vertical) => ({ vertical }));
}

export async function generateMetadata({
  params,
}: UseCasePageProps): Promise<Metadata> {
  const { vertical } = await params;

  if (!isUseCaseId(vertical)) {
    return { title: "Use case not found" };
  }

  const data = getUseCaseData(vertical);

  return buildPageMetadata({
    title: data.seo.title,
    description: data.seo.description,
    keywords: data.seo.keywords,
    path: `/use-cases/${vertical}`,
    ogImage: "/og/use-cases.png",
    ogImageAlt: `${data.label} escrow use case with OFFER-HUB`,
  });
}

export default async function UseCasePage({ params }: UseCasePageProps) {
  const { vertical } = await params;

  if (!isUseCaseId(vertical)) {
    notFound();
  }

  return <UseCaseLayout vertical={vertical} />;
}
