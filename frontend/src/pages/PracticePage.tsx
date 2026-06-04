import { RealtimePracticeRoom } from '../components/RealtimePracticeRoom';

export function PracticePage() {
  return (
    <div style={{ height: 'calc(100vh - 180px)', borderRadius: '16px', overflow: 'hidden' }}>
      <RealtimePracticeRoom />
    </div>
  );
}

export default PracticePage;
