import { useMemo } from 'react';
import { MyParkingSession } from '../components/parking-session-page/MyParkingSession';
import { AdminParkingSession } from '../components/parking-session-page/AdminParkingSession';
import '../styles/parking-session.css';

function ParkingSession() {
  const currentUser = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user_info');
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }, []);

  const isAdmin = useMemo(() => {
    return currentUser && ['ADMIN', 'MANAGER'].includes(String(currentUser.role ?? '').toUpperCase());
  }, [currentUser]);

  return (
    <div className="parking-session-page">
      {isAdmin ? <AdminParkingSession /> : <MyParkingSession />}
    </div>
  );
}

export default ParkingSession;
