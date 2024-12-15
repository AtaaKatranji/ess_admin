
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
type AddExtraHoursModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string; // Pass employeeId from the parent
};
type ExtraHours = {
  addedHours: number,
  addedAt: Date, // Default to today
  month: number, // Default to current month (1-based index)
  reason: string,
}

const AddExtraHoursModal = ({ isOpen, onClose, employeeId }: AddExtraHoursModalProps) => {

  const form = useForm<ExtraHours>()
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

  const handleSubmit = async (data: ExtraHours) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extraHours/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, employeeId }),
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
          <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-1">
            <FormField name="addedHours" render={({ field }) => (
                <FormItem className="mb-4">
                    <FormLabel>Added Hours</FormLabel>
                    <FormControl>
                        <input
                            type="number"
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            className="w-full border rounded px-3 py-2"
                            required
                            min="0"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
             )} />
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField name="addedAt" render={({ field }) => (
                <FormItem>
                    <FormLabel>Added At</FormLabel>
                    <FormControl>
                        <input
                            type="date"
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField name="month" render={({ field }) => (
                <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                        <select
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
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
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>

        <div className="col-span-1">
        <FormField name="reason" render={({ field }) => (
                <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                        <input
                           
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
           )} />
        </div>
    </div>

    <div className="flex justify-end space-x-4 mt-4">
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
</Form>
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