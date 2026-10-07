import { Invitation } from '@/components/Invitation';
import { wedding } from '@/config/wedding.config';

export default function Page() {
  return <Invitation config={wedding} />;
}
