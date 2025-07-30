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
  adminId:string,
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[];
  slug: string;
}

const SettingsPage: React.FC = () => {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();

  const [institutionInfo, setInstitutionInfo] = useState<InstitutionInfo>({
    name: '',
    adminId:'',
    address: '',
    uniqueKey: '',
    macAddresses: [],
    slug: '',
  });
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
        const data = await fetchInstitution(slug!.toString());
        console.log('Fetched institution data:', data);
        let parsedMacAddresses = [];
        if (typeof data.macAddresses === 'string') {
          try {
            parsedMacAddresses = JSON.parse(data.macAddresses);
          } catch (e) {
            console.error('Error parsing macAddresses:', e);
          }
        } else if (Array.isArray(data.macAddresses)) {
          parsedMacAddresses = data.macAddresses;
        }
        setInstitutionInfo({
          ...data,
          macAddresses: parsedMacAddresses,
        });
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
      const newSS = {
        wifiName: newSSID,
        macAddress: newMacAddress,
      };
  
      // Optimistically update the state
      setInstitutionInfo((prevInfo) => ({
        ...prevInfo,
        macAddresses: [...prevInfo.macAddresses, newSS],
      }));
  
      try {
        const data = await updatedInstitutionInfo(
          {
            ...institutionInfo,
            macAddresses: [...institutionInfo.macAddresses, newSS],
          },
          institutionInfo.slug
        );
  
        if (data) {
          toast.success(`Institution updated successfully.`);
          // Parse macAddresses if it’s a string, otherwise use it or default to []
          const parsedMacAddresses = typeof data.macAddresses === 'string'
            ? JSON.parse(data.macAddresses)
            : Array.isArray(data.macAddresses)
            ? data.macAddresses
            : [];
          setInstitutionInfo({ ...data, macAddresses: parsedMacAddresses });
        } else {
          toast.error(`Failed to update institution.`);
          setErrorName('Failed to update institution.');
          // Optionally revert optimistic update on failure
          setInstitutionInfo((prevInfo) => ({
            ...prevInfo,
            macAddresses: prevInfo.macAddresses.filter(
              (ssid) => ssid.macAddress !== newSS.macAddress
            ),
          }));
        }
      } catch (error) {
        console.error('Error updating institution:', (error as Error).message);
        setErrorName('An error occurred while saving. Please try again.');
        // Revert optimistic update on error
        setInstitutionInfo((prevInfo) => ({
          ...prevInfo,
          macAddresses: prevInfo.macAddresses.filter(
            (ssid) => ssid.macAddress !== newSS.macAddress
          ),
        }));
      }
  
      // Clear input fields
      setNewSSID('');
      setNewMacAddress('');
    }
  };
  
  const handleDeleteSSID = async (id: string) => {
    if (institutionInfo.macAddresses.length === 1) {
      toast.error("You must have at least one Wi-Fi network before deleting.");
      return;
    }
  
    // Store the original macAddresses for rollback in case of failure
    const originalMacAddresses = [...institutionInfo.macAddresses];
  
    // Optimistically update the local state
    setInstitutionInfo((prevInfo) => ({
      ...prevInfo,
      macAddresses: prevInfo.macAddresses.filter((ssid) => ssid.macAddress !== id),
    }));
  
    // Prepare updated institution data
    const updatedInfo = {
      ...institutionInfo,
      macAddresses: institutionInfo.macAddresses.filter((ssid) => ssid.macAddress !== id),
    };
  
    try {
      // Make API call to update the institution data on the backend
      const data = await updatedInstitutionInfo(updatedInfo, institutionInfo.slug);
  
      if (data) {
        // Success: Parse macAddresses and update state
        toast.success(`Institution updated successfully.`);
        const parsedMacAddresses = typeof data.macAddresses === 'string'
          ? JSON.parse(data.macAddresses)
          : Array.isArray(data.macAddresses)
          ? data.macAddresses
          : [];
        setInstitutionInfo({ ...data, macAddresses: parsedMacAddresses });
      } else {
        // Handle error response
        toast.error("Failed to update institution.");
        setErrorName("Failed to update institution.");
        // Revert optimistic update
        setInstitutionInfo((prevInfo) => ({
          ...prevInfo,
          macAddresses: originalMacAddresses,
        }));
      }
    } catch (error) {
      console.error('Error updating institution:', (error as Error).message);
      setErrorName('An error occurred while saving. Please try again.');
      // Revert optimistic update on error
      setInstitutionInfo((prevInfo) => ({
        ...prevInfo,
        macAddresses: originalMacAddresses,
      }));
    }
  };

  const handleGenerateNewKey = () => {
    
    setInstitutionInfo((prevInfo) => ({
      ...prevInfo,
      uniqueKey: Math.random().toString(36).substr(2, 9),
    }));
  };

  const handleDelete = async () => {
    if (!institutionInfo.adminId) {
      toast.error('Cannot delete: Admin ID is missing.');
      return;
    }
    const adminId = institutionInfo.adminId;
    console.log("adminId before delete:", institutionInfo.adminId);
    console.log("deleted slug: ", institutionInfo.slug);
    const res = await deleteInstitutionInfo(institutionInfo.slug);
    console.log('Delete response:', res);
    try{
      if(res == "Institution deleted successfully"){
        toast.success("Institution deleted successfully");
        //toast(`${res}`,);
        setTimeout(() => {
          //navigate.push(`/dashboard?adminId=${adminId}`);
          router.push(`/dashboard?adminId=${adminId}`); // Adjust this path if needed
        }, 1500);
      }else{
        toast.error(`Failed to delete institution: ${res}`);
        //toast(`${res}`);
      }
    }catch (error) {
      console.error('Error during deletion:', error);
  toast.error('Failed to delete institution.');
    }
    

  }

  const handleCheckName = () => {
    console.log(initialName);
    console.log("1: ",institutionInfo.name);
    if (institutionInfo.name && institutionInfo.name !== initialName) { // Only check if name has changed
      const timeoutId = setTimeout(async () => {
        setLoading(true);
        const res = await checkNameExists(institutionInfo.name,institutionInfo.adminId);
        
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
      <div className="container w-full max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Settings</h1>
  
        {/* Institution Info */}
        <div className="mb-8 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">Institution Information</h2>
            <Button
              onClick={() => setIsEditing((prev) => !prev)}
              className="flex items-center px-6 py-3 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Edit className="mr-3 h-5 w-5" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </div>
  
          <div className="space-y-8">
            <div>
              <label className="block text-xl font-semibold mb-3 text-gray-700">Name:</label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={institutionInfo.name}
                    onBlur={handleCheckName}
                    onChange={(e) => setInstitutionInfo({ ...institutionInfo, name: e.target.value })}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {errorName && <p className="text-red-500 text-base mt-2">{errorName}</p>}
                  {loading && <span className="text-blue-500 text-base mt-2">Checking...</span>}
                  {isNameTaken === true && <span className="text-red-500 text-base mt-2">Name already taken</span>}
                  {isNameTaken === false && <span className="text-green-500 text-base mt-2">✔ Name is available</span>}
                </div>
              ) : (
                <p className="text-xl text-gray-800 bg-gray-50 p-4 rounded-lg">{institutionInfo.name}</p>
              )}
            </div>
  
            <div>
              <label className="block text-xl font-semibold mb-3 text-gray-700">Address:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={institutionInfo.address}
                  onChange={(e) => setInstitutionInfo({ ...institutionInfo, address: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              ) : (
                <p className="text-xl text-gray-800 bg-gray-50 p-4 rounded-lg">{institutionInfo.address}</p>
              )}
            </div>
  
            <div>
              <label className="block text-xl font-semibold mb-3 text-gray-700">Unique Key:</label>
              <div className="flex items-center space-x-6">
                <p className="text-xl text-gray-800 bg-gray-50 p-4 rounded-lg font-mono">{institutionInfo.uniqueKey}</p>
                {isEditing && (
                  <Button
                    onClick={handleGenerateNewKey}
                    className="flex items-center px-5 py-3 text-base font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate New Key
                  </Button>
                )}
              </div>
            </div>
  
            {isEditing && (
              <Button
                onClick={handleSaveInstitutionInfo}
                className="flex items-center px-8 py-4 text-lg font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Save className="mr-3 h-6 w-6" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
  
        {/* SSID List */}
        <div className="mb-8 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">WiFi Networks</h2>
          </div>
  
          <ul className="space-y-6">
            {institutionInfo.macAddresses?.map((ssidInfo) => (
              <li
                key={ssidInfo.macAddress}
                className="flex justify-between items-center p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-800">SSID: {ssidInfo.wifiName}</p>
                  <p className="text-lg text-gray-600 font-mono">MAC Address: {ssidInfo.macAddress}</p>
                </div>
                <Button
                  onClick={() => handleDeleteSSID(ssidInfo.macAddress)}
                  variant="destructive"
                  className="flex items-center px-5 py-3 text-base font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Delete
                </Button>
              </li>
            ))}
          </ul>
  
          {/* Add New SSID */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Add New WiFi Network</h3>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <input
                type="text"
                placeholder="SSID Name"
                value={newSSID}
                onChange={(e) => setNewSSID(e.target.value)}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="MAC Address"
                value={newMacAddress}
                onChange={(e) => setNewMacAddress(e.target.value)}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <Button
              onClick={handleAddSSID}
              className="flex items-center px-6 py-3 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Add WiFi Network
            </Button>
          </div>
        </div>
  
        {/* Delete function */}
        <div className="mb-8 p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <h2 className="text-3xl font-semibold mb-6 text-red-700">Danger Zone</h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-red-50 rounded-xl border-2 border-red-200 space-y-4 sm:space-y-0">
            <div>
              <h4 className="text-2xl font-semibold text-gray-800 mb-2">Delete Institution</h4>
              <p className="text-lg text-gray-600">
                Permanently delete <strong>{institutionInfo.name}</strong> and all associated data.
              </p>
            </div>
  
            {isDelete === true && (
              <Dialog open={isDelete} onOpenChange={setIsDelete}>
                <DialogContent className="p-6 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4 text-gray-800">Confirm Deletion</DialogTitle>
                    <DialogDescription className="text-lg mb-6 text-gray-600">
                      Are you sure you want to delete <strong>{institutionInfo.name}</strong>? This action cannot be
                      undone.
                      <Input
                        className="mt-4 text-lg p-3"
                        placeholder="Enter institution name to confirm"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                      />
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="space-x-3">
                    <Button
                      variant="destructive"
                      className="px-6 py-3 text-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                      onClick={confirmDeletion}
                      disabled={inputName !== institutionInfo.name}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-6 py-3 text-lg font-bold bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setIsDelete(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
  
            {isDelete === false && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDelete(true)}
                    className="px-6 py-3 text-lg font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Delete Institution
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </div>
  
        <ToastContainer />
      </div>
    )
  }
  
  export default SettingsPage
