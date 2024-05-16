import { Card, Spinner } from "flowbite-react";
import { ReactNode } from "react";

export interface StepListItemProps {
  step: number;
  currentStep: number;
  loading: boolean;
  children?: ReactNode;
}

export default function StepDetail(props: StepListItemProps) {
  const { step, currentStep, loading, children } = props;
  if (step === currentStep) {
    if (loading) {
      return (
        <Card className="h-40">
          <div className="flex items-center justify-center">
            <Spinner size="xl" />
          </div>
        </Card>
      );
    }
    return children;
  }
  return null;
}
