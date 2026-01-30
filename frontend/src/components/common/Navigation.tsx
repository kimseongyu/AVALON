"use client";
import { ActionButton } from "@/components/common/ActionButton";
import { LinkButton } from "@/components/common/LinkButton";
import { useNavigation } from "@/hooks/useNavigation";
import { useRouter } from "next/navigation";
import { INFO_MESSAGES } from "@/constants/messages";

export const Navigation = () => {
  const router = useRouter();

  const { getButtons, projectId, scenarioId } = useNavigation({
    onLogoutSuccess: () => {
      router.push("/login");
    },
    onGenerateTestcasesSuccess: () => {
      alert(INFO_MESSAGES.TESTCASE.CREATE_INFO);
      router.push(
        `/project/scenario?projectId=${projectId}&scenarioId=${scenarioId}`
      );
    },
    onRunApiTestSuccess: (scenarioId: string) => {
      router.push(
        `/project/test-run?projectId=${projectId}&scenarioId=${scenarioId}`
      );
    },
  });

  const buttons = getButtons();

  return (
    <nav className="flex flex-wrap gap-2">
      {buttons.map((button, index) => {
        if (button.type === "link") {
          return (
            <LinkButton key={index} href={button.href} ariaLabel={button.text}>
              {button.text}
            </LinkButton>
          );
        } else if (button.type === "action") {
          return (
            <ActionButton
              key={index}
              onClick={button.onClick}
              disabled={button.loading}
            >
              {button.text}
            </ActionButton>
          );
        }
        return null;
      })}
    </nav>
  );
};
