import PageLayout from "@/components/common/PageLayout";
import PageHeader from "@/components/common/PageHeader";
import ContractManagementTabs from "@/components/contract-management/ContractManagementTabs";
import { ScrollText } from "lucide-react";
import { useLanguageHook } from "@/components/useLanguageHook";

export default function ContractsPage() {
  const { t } = useLanguageHook();
  return (
    <PageLayout>
      <PageHeader
        title={t("pageTitles.contracts", { defaultValue: "Contracts" })}
        description={t("contracts.pageDescription", {
          defaultValue: "Manage contracts and related templates.",
        })}
        icon={ScrollText}
      />
      <ContractManagementTabs />
    </PageLayout>
  );
}

ContractsPage.propTypes = {};

