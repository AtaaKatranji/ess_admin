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
          macAddresses: parsedMacAddresses || [],
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
    const data = await updatedInstitutionInfo(institutionInfo,institutionInfo.slug)
    try {
      if (data) {
        console.log('Update response data:', data);
        // Handle successful update
        toast.success(`Institution updated successfully`);
        // Parse macAddresses if it's a string, otherwise use it or default to []
        const parsedMacAddresses = typeof data.macAddresses === 'string'
          ? JSON.parse(data.macAddresses)
          : Array.isArray(data.macAddresses)
          ? data.macAddresses
          : [];
        console.log('Parsed macAddresses:', parsedMacAddresses);
        // Update the state with the new institution data
        setInstitutionInfo({ ...data, macAddresses: parsedMacAddresses });
      } else {
        // Handle error response
        toast.error(`Failed to update institution`);
        setErrorName('Failed to update institution'); // Show error to the user
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
        macAddresses: [...(prevInfo.macAddresses || []), newSS],
      }));
  
      try {
        const data = await updatedInstitutionInfo(
          {
            ...institutionInfo,
            macAddresses: [...(institutionInfo.macAddresses || []), newSS],
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
            macAddresses: (prevInfo.macAddresses || []).filter(
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
          macAddresses: (prevInfo.macAddresses || []).filter(
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
    if (!institutionInfo.macAddresses || institutionInfo.macAddresses.length === 1) {
      toast.error("You must have at least one Wi-Fi network before deleting.");
      return;
    }
  
    // Store the original macAddresses for rollback in case of failure
    const originalMacAddresses = [...(institutionInfo.macAddresses || [])];
  
    // Optimistically update the local state
    setInstitutionInfo((prevInfo) => ({
      ...prevInfo,
      macAddresses: (prevInfo.macAddresses || []).filter((ssid) => ssid.macAddress !== id),
    }));
  
    // Prepare updated institution data
    const updatedInfo = {
      ...institutionInfo,
      macAddresses: (institutionInfo.macAddresses || []).filter((ssid) => ssid.macAddress !== id),
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
  console.log('Current institutionInfo:', institutionInfo);
  console.log('Current macAddresses:', institutionInfo.macAddresses);
  
  return (
    <div className="container w-full max-w-screen mx-auto ">
      <h1 className="p-4 text-2xl font-bold  text-gray-800 ">Settings</h1>

      {/* Institution Info */}
      <div className="m-6 p-6 bg-white rounded-xl shadow-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Institution Information</h2>
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={institutionInfo.name}
              onBlur={handleCheckName}
              onChange={(e) =>
                setInstitutionInfo({ ...institutionInfo, name: e.target.value })
              }
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {loading && <span className="text-sm text-gray-500">Checking...</span>}
            {errorName && <p className="text-red-500 text-sm">{errorName}</p>}
            {isNameTaken === true && (
              <span className="text-sm text-red-600">Name already taken</span>
            )}
            {isNameTaken === false && (
              <span className="text-sm text-green-600">✔ Name is available</span>
            )}
          </div>
        ) : (
          <p className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-800">{institutionInfo.name}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        {isEditing ? (
          <input
            type="text"
            value={institutionInfo.address}
            onChange={(e) =>
              setInstitutionInfo({ ...institutionInfo, address: e.target.value })
            }
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <p className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-800">{institutionInfo.address}</p>
        )}
      </div>

      {/* Unique Key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unique Key</label>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <p className="flex-1 font-mono bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-800">{institutionInfo.uniqueKey}</p>
          {isEditing && (
            <button
              onClick={handleGenerateNewKey}
              className="mt-3 sm:mt-0 flex items-center px-4 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate
            </button>
          )}
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="pt-4">
          <button
            onClick={handleSaveInstitutionInfo}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            <div className="flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </div>
          </button>
        </div>
      )}
    </div>

    {/* SSID List */}
    <div className="m-6 p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">WiFi Networks</h2>
      </div>

      {/* Existing SSIDs */}
      <ul className="space-y-4">
        {(institutionInfo.macAddresses || []).map((ssidInfo) => (
          <li
            key={ssidInfo.macAddress}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-gray-50 rounded-md border"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">SSID: {ssidInfo.wifiName}</p>
              <p className="text-sm text-gray-600">MAC: {ssidInfo.macAddress}</p>
            </div>
            <button
              onClick={() => handleDeleteSSID(ssidInfo.macAddress)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Add New SSID */}
      <div className="p-5 bg-gray-50 rounded-md border space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Add New WiFi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="SSID Name"
            value={newSSID}
            onChange={(e) => setNewSSID(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="MAC Address"
            value={newMacAddress}
            onChange={(e) => setNewMacAddress(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleAddSSID}
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Network
        </button>
      </div>
    </div>

      {/* Delete Institution Section */}
      <div className="m-6 p-6 bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Delete This Institution</h2>

        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-lg font-semibold text-red-800">{institutionInfo.name}</h4>

          {/* Trigger Delete Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="px-4 py-2 text-sm font-semibold"
                onClick={() => setIsDelete(true)}
              >
                Delete
              </Button>
            </DialogTrigger>

            {isDelete && (
              <DialogContent className="max-w-md p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-red-600">Confirm Deletion</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-2">
                    This action cannot be undone. To confirm, type the institution name below:
                  </DialogDescription>
                </DialogHeader>

                <Input
                  className="mt-4"
                  placeholder="Enter institution name to confirm"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                />

                <DialogFooter className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    disabled={inputName !== institutionInfo.name}
                    onClick={confirmDeletion}
                    className="px-4 py-2"
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDelete(false)}
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>

        <ToastContainer />
      </div>

    </div>
  );
};

export default SettingsPage;
