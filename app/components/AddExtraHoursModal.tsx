import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
type AddExtraHoursModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string; // Pass employeeId from the parent
};

const AddExtraHoursModal = ({ isOpen, onClose, employeeId }: AddExtraHoursModalProps) => {
  const [formData, setFormData] = useState({
    addedHours: 0,
    addedAt: new Date().toISOString().split('T')[0], // Default to today
    month: new Date().getMonth() + 1, // Default to current month (1-based index)
    reason: '',
  });

  const months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'month' ? parseInt(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extraHours/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, employeeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add extra hours');
      }

      alert('Extra hours added successfully');
      onClose();
    } catch (error) {
      alert('Failed to add extra hours: ' + (error as Error).message);
    }
  };

  return (
    isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Tabs defaultValue="handel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="handel">Add Extra Hours</TabsTrigger>
          <TabsTrigger value="listAdded">List Added</TabsTrigger>
        </TabsList>
        <TabsContent value="handel" className="space-y-4">
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4">Add Extra Hours</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Added Hours</label>
              <input
                type="number"
                name="addedHours"
                value={formData.addedHours}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Added At</label>
              <input
                type="date"
                name="addedAt"
                value={formData.addedAt}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select a month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            

            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-900 text-white px-4 py-2 rounded"
              >
                Add Hours
              </button>
            </div>
          </form>
        </div>
         </TabsContent>
        <TabsContent value="listAdded" className="space-y-4">
        
        </TabsContent>
        
      </Tabs>
      </div>
      
    )
  );
};

export default AddExtraHoursModal;