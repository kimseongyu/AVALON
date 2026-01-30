import { TestRunLayoutContent } from "@/components/test-run/TestRunLayoutContent";

const TestRunLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <TestRunLayoutContent>{children}</TestRunLayoutContent>;
};

export default TestRunLayout;