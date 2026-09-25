import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getRetailSubVertical } from "./RetailSubVerticalData";

export default function RetailSubVerticalPage() {
  return <SubVerticalPage industry="Retail" href="/industries/retail" getSubVertical={getRetailSubVertical} />;
}
