import { useState } from 'react';

type AddExtraHoursModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string; // Pass employeeId from the parent
};

const AddExtraHoursModal = ({ isOpen, onClose, employeeId }: AddExtraHoursModalProps) => {
  const [formData, setFormData] = useState({
    addedHours: 0,
    addedAt: new Date().toISOString().split('T')[0], // Default to today
    reason: '',
  });

//   const [reasons, setReasons] = useState([
//     'Overtime Work',
//     'Project Deadline',
//     'Emergency Support',
//   ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/extra-hours-adjustments', {
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
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
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
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Hours
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};
export default AddExtraHoursModal;