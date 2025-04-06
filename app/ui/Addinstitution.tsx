import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Copy, Plus, X, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GenerateKey, checkNameExists, copyToClipboard } from '../api/institutions/institutions';
import { extractAdminId } from '../utils/extractId';
import { parseCookies } from 'nookies';
const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

type MacAddressEntry = {
  wifiName: string;
  macAddress: string;
};

interface AddInstitutionDialogProps {

  onSuccess?: () => void;  // Optional callback when institution is added successfully
}

const AddInstitutionDialog: React.FC<AddInstitutionDialogProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [keyNumber, setKeyNumber] = useState('');
  const [macAddresses, setMacAddresses] = useState<MacAddressEntry[]>([]);
  const [wifiName, setWifiName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [error, setError] = useState('');
  const [errorName, setErrorName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isNameTaken, setIsNameTaken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const cookies = parseCookies(); 
  
 

  // Usage
  const onSuccessA = () => {
    setName('');
    setAddress('');
    setKeyNumber('');
    setMacAddresses([]);
    setIsNameTaken(null);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true)
    if (macAddresses.length === 0) {
      toast.error("Please add at least one Wi-Fi Network before submitting.");
      setError("Please add at least one Wi-Fi Network before submitting.");
      setIsLoading(false)
      return;
    }
    console.log("in handle submit",isNameTaken)
    if(isNameTaken === true){
      console.log("in handle submit2 ",isNameTaken)
      setErrorName("Please Change Name.");
      setIsNameTaken(null);
      setIsLoading(false)
      return;
    }
    
    try {
    const adminId = extractAdminId(token!);
    const institutionData = { adminId, name, address, keyNumber, macAddresses };
    console.log("in handle submit",institutionData)
    const response = await fetch(`${BaseUrl}/ins/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionData),
        credentials:'include'
      });

      if (response.ok) {
        await response.json();
        setIsModalOpen(false); // Close the modal on success
        onSuccessA(); 
        onSuccess?.(); // Optional success callback
      } else {
        toast.error(`Error adding institution: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`Error:${error}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  };

  const handleAddMacAddress = () => {
    if (wifiName && macAddress) {
      setMacAddresses([...macAddresses, { wifiName, macAddress }]);
      setWifiName('');
      setMacAddress('');
      setError('');
    }
  };

  const handleDelete = (index: number) => {
    setMacAddresses(macAddresses.filter((_, i) => i !== index));
  };

  const setKey = () => {
    const key = GenerateKey();
    setKeyNumber(key || "updateKey");
  };

  const handleCopy = () => {
    copyToClipboard(keyNumber);
    <ToastContainer />
  };
  const handleCheckName = () => {
    if (name) {
      const adminId = extractAdminId(token!);
      const timeoutId = setTimeout(async() => {
        setLoading(true);
        const res= await checkNameExists(name,adminId!);
        setLoading(false);
        if (typeof res === "boolean") {
          console.log("res ", res)
          setIsNameTaken(res); 
          console.log(isNameTaken)// Set the isNameTaken state if it's a boolean
          setErrorName(''); // Clear the error if name is checked successfully
        } else if (typeof res === "string") {
          setErrorName(res); // Set the error message if res is a string (like "Please Add Name.")
          setIsNameTaken(null); // Clear name check if there's an error
        }
        
      }, 500); // debounce to avoid too many API calls
      return () => clearTimeout(timeoutId);
    }
  }

useEffect(() => {
  const cookieToken = cookies.token;
    setToken( cookieToken || null )
    console.log("token in add Institution: ",token);
}, [token]);



  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button  onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Institution
        </Button>
      </DialogTrigger>

      <DialogContent style={{ maxHeight: '99vh', maxWidth: '90vh' }}>
        <DialogHeader>
          <DialogTitle>Add New Institution</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <label htmlFor="name">Institution Name</label>
            {/* <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter institution name" required /> */}
            <div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)
                
              }
              onBlur={handleCheckName}
              placeholder="Enter institution name"
              className='my-2'
              required
            />
              {errorName && <p className="text-red-500 text-sm">{errorName}</p>}
              {loading && <span>Checking...</span>}

              {isNameTaken === true && (
                <span style={{ color: 'red' }}>Name already taken</span>
              )}

              {isNameTaken === false && (
                <span style={{ color: 'green' }}>✔ Name is available</span>
              )}
              {isNameTaken === null && (
                <span> </span>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <label htmlFor="address">Address</label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" required />
          </div>

          <div className="flex flex-col space-y-4">
            <label htmlFor="keyNumber">Key Number</label>
            <div className="flex space-x-4 w-full">
              <Input id="keyNumber" value={keyNumber} onChange={(e) => setKeyNumber(e.target.value)} disabled placeholder="Generate key number" required />
              <Button type="button" onClick={setKey}><KeyRound /></Button>
              <Button type="button" onClick={handleCopy}><Copy /></Button>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <label htmlFor="wifiNetworks">Wi-Fi Networks</label>
            <div className="overflow-y-auto" style={{ height: '100px' }}>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <ul className="list-none">
                {macAddresses.map((entry, index) => (
                  <li key={index} className="bg-gray-200 mb-2 p-2 rounded flex justify-between items-center">
                    <span>{entry.wifiName}: {entry.macAddress}</span>
                    <button type="button" onClick={() => handleDelete(index)} className="text-red-500"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-2 w-full">
              <Input id="wifiName" value={wifiName} onChange={(e) => setWifiName(e.target.value)} placeholder="Wi-Fi Name" />
              <Input id="macAddress" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} placeholder="Enter MAC Address" />
              <Button type='button' onClick={handleAddMacAddress}><Plus /></Button>
            </div>
          </div>

          <Button type="submit" 
          >{isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Institution'
          )}</Button>
        </form>
        <ToastContainer />
      </DialogContent>
    </Dialog>
  );
};

export default AddInstitutionDialog;
