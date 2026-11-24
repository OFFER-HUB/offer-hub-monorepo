"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";

export interface ResponseTab {
  status: string;
  label: string;
  body: string;
}

interface ResponseViewerProps {
  responses: ResponseTab[];
}

/** Example response tabs rendered by the shared CodeBlock. */
export function ResponseViewer({ responses }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <CodeBlock
      tabs={responses.map((response, index) => ({
        id: `${response.status}-${index}`,
        label: `${response.status} ${response.label}`,
        code: response.body,
        language: "json",
      }))}
      activeIndex={activeTab}
      onTabChange={setActiveTab}
      label="Example responses"
      className="my-0"
      dense
    />
  );
}
