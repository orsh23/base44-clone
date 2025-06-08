import React, { useState } from "react";
import PageLayout from "@/components/common/PageLayout";
import PageHeader from "@/components/common/PageHeader";
import { Users } from "lucide-react"; // Changed from UsersCog to Users
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProvidersTab from "@/components/providers/ProvidersTab";
import DoctorsTab from "@/components/doctors/DoctorsTab";
import ProviderDoctorLinkageTab from "@/components/provider-doctor-linkage/ProviderDoctorLinkageTab";
import { useLanguageHook } from "@/components/useLanguageHook";

export default function NetworkManagementPage() {
  const { t, isRTL } = useLanguageHook();
  const [activeTab, setActiveTab] = useState("providers");

  // t dependency ensures tab labels update when language changes
  const TABS_CONFIG = React.useMemo(
    () => [
      {
        value: "providers",
        labelKey: "pageTitles.providers",
        defaultLabel: "Providers",
        component: <ProvidersTab />,
      },
      {
        value: "doctors",
        labelKey: "pageTitles.doctors",
        defaultLabel: "Doctors",
        component: <DoctorsTab />,
      },
      {
        value: "linkage",
        labelKey: "pageTitles.providerDoctorLinkageShort",
        defaultLabel: "Linkage",
        component: <ProviderDoctorLinkageTab />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return (
    <PageLayout>
      <PageHeader
        title={t("pageTitles.networkManagement", {
          defaultValue: "Network Management",
        })}
        description={t("networkManagement.pageDescription", {
          defaultValue: "Manage providers, doctors, and their affiliations.",
        })}
        icon={Users} // Using Users icon
      />
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        dir={isRTL ? "rtl" : "ltr"}
        className="mt-6"
      >
        <TabsList className="mb-4 grid w-full grid-cols-1 sm:grid-cols-3">
          {TABS_CONFIG.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {t(tab.labelKey, { defaultValue: tab.defaultLabel })}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS_CONFIG.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {/* Render component only if it's the active tab to avoid unnecessary mounts/fetches */}
            {activeTab === tab.value && tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </PageLayout>
  );
}

NetworkManagementPage.propTypes = {};
