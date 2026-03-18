import { SetURLSearchParams } from "react-router-dom";

interface UseTabChangeWithUrlProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

export function useTabChangeWithUrl({
  activeTab,
  setActiveTab,
  searchParams,
  setSearchParams,
}: UseTabChangeWithUrlProps) {
  return (value: string) => {
    if (value === activeTab) return;

    setActiveTab(value);

    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    setSearchParams(params, { replace: true });
  };
}
