import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"


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
    <div className="flex justify-between items-center">
    <h3 className="text-lg font-medium">Absences</h3>
    <Card>
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-8">
              {/* Paid Leaves Section */}
              <div>
                
                {absentDays.length > 0 ? (
                  absentDays
                   
                ) : (
                  <p className="text-sm text-muted-foreground">No Abssent.</p>
                )}
              </div>
              
            </div>
          </ScrollArea>
        </Card>
        </div>
  );
};

export default AbsentTab;
