import { getKana } from "@/lib/datasets";
import { KanaSection } from "@/components/KanaSection";

export default function KanaPage() {
  const kana = getKana();
  return <KanaSection kana={kana} />;
}
