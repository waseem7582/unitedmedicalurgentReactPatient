import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Main from "./Global/Main";
import ErrorBoundary from "./ErrorBoundary";
import WhatsAppButton from "./Components/WhatsappFloatingBtn";

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 80000,
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {" "}
        <Main />
        <WhatsAppButton />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
