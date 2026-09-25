import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getSubVertical } from "./FSSubVerticalData";

export default function FSSubVerticalPage() {
  return <SubVerticalPage industry="Financial Services" href="/industries/financial-services" getSubVertical={getSubVertical} />;
}
