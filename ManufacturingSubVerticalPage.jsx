import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getManufacturingSubVertical } from "./ManufacturingSubVerticalData";

export default function ManufacturingSubVerticalPage() {
  return <SubVerticalPage industry="Manufacturing" href="/industries/manufacturing" getSubVertical={getManufacturingSubVertical} />;
}
