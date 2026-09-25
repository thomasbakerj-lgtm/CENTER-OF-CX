import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getHCSubVertical } from "./HCSubVerticalData";

export default function HCSubVerticalPage() {
  return <SubVerticalPage industry="Healthcare" href="/industries/healthcare" getSubVertical={getHCSubVertical} />;
}
