import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getTravelSubVertical } from "./TravelSubVerticalData";

export default function TravelSubVerticalPage() {
  return <SubVerticalPage industry="Travel" href="/industries/travel" getSubVertical={getTravelSubVertical} />;
}
