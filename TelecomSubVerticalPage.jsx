import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getTelecomSubVertical } from "./TelecomSubVerticalData";

export default function TelecomSubVerticalPage() {
  return <SubVerticalPage industry="Telecommunications" href="/industries/telecom" getSubVertical={getTelecomSubVertical} />;
}
