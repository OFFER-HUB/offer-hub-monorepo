import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PillTabsProps } from '@/types';
import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function PillTabs({
  tabs,
  defaultValue,
  className,
  tabsListclassName,
  triggerClassName,
  activeTriggerClassName,
  inactiveTriggerClassName,
  value,
  onValueChange,
  renderContent = true,
}: PillTabsProps) {
  const router = useRouter();
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue || tabs[0]?.value}
      className={className || 'w-full'}
    >
      <TabsList
        className={
          'flex w-full gap-2 p-1 bg-transparent rounded-full ' +
          tabsListclassName
        }
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={clsx(
              'rounded-[4px] px-4 py-2 text-sm font-medium transition-all flex-1',
              activeTriggerClassName || 'data-[state=active]:bg-[#002333] data-[state=active]:text-white',
              inactiveTriggerClassName || 'data-[state=inactive]:text-[#002333]',
              triggerClassName
            )}
            onClick={() => {
              // If the tab item provides an href, navigate to it
              // This enables cross-page tab navigation while preserving the same UI
              const href = (tab as any).href as string | undefined;
              if (href) router.push(href);
            }}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {renderContent &&
        tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.component}
          </TabsContent>
        ))}
    </Tabs>
  );
}
