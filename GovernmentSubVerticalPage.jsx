import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getGovernmentSubVertical } from "./GovernmentSubVerticalData";

export default function GovernmentSubVerticalPage() {
  return <SubVerticalPage industry="Government" href="/industries/government" getSubVertical={getGovernmentSubVertical} />;
}
