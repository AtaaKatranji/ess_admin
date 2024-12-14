import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from 'lucide-react';
import { format } from "date-fns"
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
    <div className="flex-col space-y-4">
    <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Absences Records</h2>
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
        {absentDays?.length > 0 ? (
          absentDays.map((date, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
            >
              <span>{format(new Date(date), "MMMM d, yyyy")}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No Absences.</p>
        )}
      </div>
    </div>
  </ScrollArea>
</Card>

        </div>
  );
};

export default AbsentTab;
