import { PageStylizationComponent } from "~/pages/PageStylization/PageStylizationComponent";
import { EngineProvider } from "~/contexts/EngineProvider";

export const PageStylization = () => {
  return (
    <EngineProvider>
      <PageStylizationComponent />
    </EngineProvider>
  );
};
