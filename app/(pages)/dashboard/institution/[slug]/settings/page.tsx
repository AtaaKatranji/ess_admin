"use client";
import React, { useEffect, useState } from 'react';
import { Edit, Save, Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import { checkNameExists, deleteInstitutionInfo, fetchInstitution, updatedInstitutionInfo } from '@/app/api/institutions/institutions';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

interface SSIDInfo {
  
  wifiName: string;
  macAddress: string;

}

interface InstitutionInfo {
  name: string;
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[];
  slug: string;
}

const SettingsPage: React.FC = () => {
  const [institutionInfo, setInstitutionInfo] = useState<InstitutionInfo>({
    name: '',
    address: '',
    uniqueKey: '',
    macAddresses: [],
    slug: '',
  });
  const params = useParams();

  const slug = params?.slug;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [newSSID, setNewSSID] = useState('');
  const [newMacAddress, setNewMacAddress] = useState('');
  const [isDelete,setIsDelete]= useState(false);
  const [errorName, setErrorName] = useState('');
  const [isNameTaken, setIsNameTaken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [inputName, setInputName] = useState('');
 
  useEffect(() => {
    // Fetch data from your backend API for the specific institution
    const fetchData = async () => {
      try {
        const data = await fetchInstitution(slug.toString());
        setInstitutionInfo(data);
        setInitialName(data.name);

      } catch (error) {
        console.error('Error fetching institution data:', error);
      }
    };
    fetchData();
  }, [slug]);
  
  const handleSaveInstitutionInfo = async () => {
    // Disable editing mode
    setIsEditing(false);
    setLoading(true); 
    if(isNameTaken === true){
      toast.error("Please change name")
      return;
    } 
    const data = updatedInstitutionInfo(institutionInfo,institutionInfo.slug)
    try {
      if (data) {
        // Handle successful update
      toast.success(`Institution updated:${data}`);
        // Optionally, you can update the state with the new institution data
      setInstitutionInfo(await data);
      } else {
        // Handle error response
        toast.error(`Failed to update institution: ${data}`);
        setErrorName(data); // Show error to the user
      }
    } catch (error) {
      console.error('Error updating institution:', (error as Error).message);
      setErrorName('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleAddSSID = async () => {
    if (newSSID && newMacAddress) {
      // Create a new SSID entry
      const newSS  = {
        // Change 'id' to '_id'
        wifiName: newSSID,
        macAddress: newMacAddress,
      };
  
      // Update the institutionInfo state with the new MAC address
      setInstitutionInfo((prevInfo) => ({
        ...prevInfo,
        macAddresses: [...prevInfo.macAddresses, newSS], // Correctly update macAddresses
      }));
  
      try {
        // Call the API to update the institution
        const data = await updatedInstitutionInfo({ 
          ...institutionInfo, 
          macAddresses: [...institutionInfo.macAddresses, newSS], // Send updated macAddresses in API call
        }, institutionInfo.slug);
  
        if (data) {
          // Success: Display success message and update institution info in state
          toast.success(`Institution updated successfully.`);
          setInstitutionInfo(data); // Update state with the response from API
        } else {
          // Handle error response
          toast.error(`Failed to update institution.`);
          setErrorName('Failed to update institution.');
        }
      } catch (error) {
        console.error('Error updating institution:', (error as Error).message );
        setErrorName('An error occurred while saving. Please try again.');
      }
  
      // Clear input fields after adding
      setNewSSID('');
      setNewMacAddress('');
    }
  };
  

  const handleDeleteSSID = async (id: string) => {
    if (institutionInfo.macAddresses.length === 1) {
      toast.error("You must have at least one Wi-Fi network before deleting.");
      return;
    }
  
    // Update the local state by filtering out the SSID with the given id
    setInstitutionInfo((prevInfo) => ({
      ...prevInfo,
      macAddresses: prevInfo.macAddresses.filter((ssid) => ssid.macAddress !== id), // Update macAddresses
    }));
  
    // Prepare updated institution data
    const updatedInfo = {
      ...institutionInfo,
      macAddresses: institutionInfo.macAddresses.filter((ssid) => ssid.macAddress !== id), // Filtered list
    };
  
    try {
      // Make API call to update the institution data on the backend
      const data = await updatedInstitutionInfo(updatedInfo, institutionInfo.slug);
  
      if (data) {
        // Success: Display success message and update institution info in state
        toast.success(`Institution updated successfully.`);
        setInstitutionInfo(data); // Update state with the response from API
      } else {
        // Handle error response
        toast.error("Failed to update institution.");
        setErrorName("Failed to update institution.");
      }
    } catch (error) {
      console.error('Error updating institution:', (error as Error).message);
      setErrorName('An error occurred while saving. Please try again.');
    }
  };
  

  const handleGenerateNewKey = () => {
    
    setInstitutionInfo((prevInfo) => ({
      ...prevInfo,
      uniqueKey: Math.random().toString(36).substr(2, 9),
    }));
  };

  const handleDelete = async () => {
      
    console.log("deleted slug: ", institutionInfo.slug);
    const res = await deleteInstitutionInfo(institutionInfo.slug);
    try{
      if(res == "Institution deleted successfully"){
        
        toast(`${res}`,);
        setTimeout(() => {
          router.push('/dashboard'); // Adjust this path if needed
        }, 1500);
      }else{
        toast(`${res}`);
      }
    }catch{
      
    }
    

  }

  const handleCheckName = () => {
    console.log(initialName);
    console.log("1: ",institutionInfo.name);
    if (institutionInfo.name && institutionInfo.name !== initialName) { // Only check if name has changed
      const timeoutId = setTimeout(async () => {
        setLoading(true);
        const res = await checkNameExists(institutionInfo.name);
        
        if (typeof res === "boolean") {
          setIsNameTaken(res);
          setErrorName('');
        } else if (typeof res === "string") {
          setErrorName(res);
          setIsNameTaken(null);
        }
        console.log(initialName);// Update initial name after check
        setLoading(false); 
      }, 1500); // debounce to avoid too many API calls
  
      return () => clearTimeout(timeoutId);
    } else {
      setIsNameTaken(null);
    }
  };
  const confirmDeletion = () => {
      if (inputName === institutionInfo.name) {
        handleDelete();
      } else {
        alert('Name does not match. Please enter the correct name to confirm deletion.');
      }
    };
  return (
    <div className="w-full max-w-screen mx-auto p-3 rounded-lg ">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Institution Info */}
      <div className="m-8 p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4 ">
          <h2 className="text-2xl font-semibold">Institution Information</h2>
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Edit className="mr-2" />
            {isEditing ? 'Cancel Edit' : 'Edit'}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-semibold">Name:</label>
            {isEditing ? (
              <div>
              <input
                type="text"
                value={institutionInfo.name}
                onBlur={handleCheckName}
                onChange={(e) =>
                  setInstitutionInfo({ ...institutionInfo, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
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
            ) : (
              <p className="text-lg">{institutionInfo.name}</p>
            )}
          </div>
          <div>
            <label className="block text-lg font-semibold">Address:</label>
            {isEditing ? (
              
              <input
                type="text"
                value={institutionInfo.address}
                
                onChange={(e) =>
                  setInstitutionInfo({ ...institutionInfo, address: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
              />
              
            ) : (
              <p className="text-lg">{institutionInfo.address}</p>
            )}
          </div>
          <div>
            <label className="block text-lg font-semibold">Unique Key:</label>
            <div className="flex items-center space-x-4">
              <p className="text-lg">{institutionInfo.uniqueKey}</p>
              {isEditing && (
                <button
                  onClick={handleGenerateNewKey}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  <RefreshCw className="mr-2" />
                  Generate New Key
                </button>
              )}
            </div>
          </div>
          {isEditing && (
            <button
              onClick={handleSaveInstitutionInfo}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Save className="mr-2" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* SSID List */}
      <div className="m-8  p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">WiFi Networks</h2>
        </div>
        <ul className="space-y-4">
          {institutionInfo.macAddresses?.map((ssidInfo) => (
            <li key={ssidInfo.macAddress} className="flex justify-between items-center p-4 bg-gray-50 rounded-md shadow">
              <div>
                <p className="font-semibold">SSID: {ssidInfo.wifiName}</p>
                <p className="text-gray-700">MAC Address: {ssidInfo.macAddress}</p>
              </div>
              <button
                onClick={() => handleDeleteSSID(ssidInfo.macAddress)}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="mr-1" />
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Add New SSID */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">Add New WiFi Network</h3>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="SSID Name"
              value={newSSID}
              onChange={(e) => setNewSSID(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="MAC Address"
              value={newMacAddress}
              onChange={(e) => setNewMacAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleAddSSID}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PlusCircle className="mr-2" />
            Add SSID
          </button>
        </div>
      </div>
      {/* Delete function */}
      <div className="m-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold my-4">Delete this institution</h2>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md shadow">
          <h4 className="text-xl font-semibold ">{institutionInfo.name}</h4>
          {isDelete === true && (
            <Dialog open={isDelete} onOpenChange={setIsDelete}>
    
            {/* Dialog Content */}
            <DialogContent className="p-4">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold my-4">Confirm Deletion</DialogTitle>
        <DialogDescription className="text-xl my-4">
          Are you sure you want to delete <strong>{institutionInfo.name}</strong>? This action cannot be undone.
          <Input 
            className="mt-4" 
            placeholder="Enter institution name to confirm" 
            value={inputName} 
            onChange={(e) => setInputName(e.target.value)} 
          />
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="space-x-2">
        <Button
          variant="destructive"
          className="fill-secondary text-white font-bold hover:bg-red-700 transition duration-200"
          onClick={confirmDeletion}
          disabled={inputName !== institutionInfo.name} // Only enable if name matches
        >
          Yes
        </Button>
        <Button
          variant="secondary"
          className="bg-gray-800 text-white font-bold hover:bg-gray-500 transition duration-200"
          onClick={() => setIsDelete(false)}
        >
          No
        </Button>
      </DialogFooter>
    </DialogContent>
          </Dialog>
          )}
          {isDelete === false && (
            // <Button variant='destructive' type="button" className='bg-blue-800 text-white font-bold' onClick={() => setIsDelete(true)}>Delete</Button>
            <Dialog>
              <DialogTrigger asChild>
                 <Button variant='destructive' onClick={() => setIsDelete(true)}>Delete</Button>
              </DialogTrigger>
            </Dialog>
            
          )}
        </div>
        <ToastContainer />
        
      </div>
    </div>
  );
};

export default SettingsPage;
