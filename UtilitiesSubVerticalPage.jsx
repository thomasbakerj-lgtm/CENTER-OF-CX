import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getUtilitiesSubVertical } from "./UtilitiesSubVerticalData";

export default function UtilitiesSubVerticalPage() {
  return <SubVerticalPage industry="Utilities" href="/industries/utilities" getSubVertical={getUtilitiesSubVertical} />;
}
