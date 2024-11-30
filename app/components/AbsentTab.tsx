import { useState, useEffect } from 'react';

const AbsentTab = ({ employeeId }: { employeeId: string }) => {
  const [absentDays, setAbsentDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checks/absences?employeeId=${employeeId}`);
        const data = await response.json();
        setAbsentDays(data.absentDates || []);
      } catch (error) {
        console.error('Error fetching absences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, [employeeId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (absentDays.length === 0) {
    return <p>No absences recorded.</p>;
  }

  return (
    <ul>
      {absentDays.map((date) => (
        <li key={date}>{new Date(date).toLocaleDateString()}</li>
      ))}
    </ul>
  );
};

export default AbsentTab;
