import SubVerticalPage from "./src/lib/SubVerticalPage.jsx";
import { getEducationSubVertical } from "./EducationSubVerticalData";

export default function EducationSubVerticalPage() {
  return <SubVerticalPage industry="Education" href="/industries/education" getSubVertical={getEducationSubVertical} />;
}
