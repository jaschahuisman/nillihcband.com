import { Suspense } from "react";
import CrmLoginPage from "./page.client";

export default function Page() {
  return (
    <Suspense>
      <CrmLoginPage />
    </Suspense>
  );
}
