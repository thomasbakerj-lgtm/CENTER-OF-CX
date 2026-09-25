import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getInsuranceSubVertical } from "./InsuranceSubVerticalData";

export default function InsuranceSubVerticalPage() {
  return <SubVerticalPage industry="Insurance" href="/industries/insurance" getSubVertical={getInsuranceSubVertical} />;
}
