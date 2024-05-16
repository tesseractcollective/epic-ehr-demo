export interface StepListItemProps {
  step: number;
  currentStep: number;
  label: string;
}

export default function StepListItem(props: StepListItemProps) {
  const { step, currentStep, label } = props;
  if (currentStep > step) {
    return (
      <li>
        <div
          className="w-full rounded-lg border border-green-300 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-gray-800 dark:text-green-400"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{label}</h3>
            <svg
              className="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
          </div>
        </div>
      </li>
    );
  }
  if (step === currentStep) {
    return (
      <li>
        <div
          className="w-full rounded-lg border border-blue-300 bg-blue-100 p-4 text-blue-700 dark:border-blue-800 dark:bg-gray-800 dark:text-blue-400"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{label}</h3>
            <svg
              className="size-4 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </div>
        </div>
      </li>
    );
  }
  return (
    <li>
      <div
        className="w-full rounded-lg border border-gray-300 bg-gray-100 p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        role="alert"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{label}</h3>
        </div>
      </div>
    </li>
  );
}
