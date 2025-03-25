import HelpHeader from "../../pages/help-page/components/help-header"
import HelpCategoryCards from "../../pages/help-page/components/help-category-cards"
import HelpTopicsTabs from "@/pages/help-page/components/help-topics-taps"
import ContactSupport from "@/pages/help-page/components/contact-support"
import CommunityResources from "@/pages/help-page/components/community-resources"
export default function HelpPage() {
    return (
        <>
        <HelpHeader />
        <HelpCategoryCards />
        <HelpTopicsTabs />
        <ContactSupport />
        <CommunityResources />
      </>
    )
  }
  