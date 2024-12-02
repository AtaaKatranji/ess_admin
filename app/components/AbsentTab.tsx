import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"

const AbsentTab = ({ employeeId }: { employeeId: string }) => {
  const [absentDays, setAbsentDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
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
    <div className="flex-col">
    <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Attendance Records</h2>
            <div className="flex space-x-2 ">
            <div className="relative">
             
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search records" 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            </div>
          </div>
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
