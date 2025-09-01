"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Edit, Save, Trash2, PlusCircle, RefreshCw, Loader2 } from 'lucide-react';
import { checkNameExists, deleteInstitutionInfo, fetchInstitution, generateInstitutionKey, updatedInstitutionInfo } from '@/app/api/institutions/institutions';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { InstitutionInfo, normalizeMacAddress, normalizeMacList, WifiEntry } from '@/app/types/Institution';
import { ApiFailure, ApiSuccess } from '@/app/lib/api';



const SettingsPage: React.FC = () => {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();

  const [institutionInfo, setInstitutionInfo] = useState<InstitutionInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenLoading, setIsGenLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newSSID, setNewSSID] = useState('');
  const [newMacAddress, setNewMacAddress] = useState('');
  const [isDelete,setIsDelete]= useState(false);
  const [errorName, setErrorName] = useState('');
  const [isNameTaken, setIsNameTaken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [inputName, setInputName] = useState('');
  const nameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0); // لمنع السباقات (race conditions)
  
  const [attendanceSettings, setAttendanceSettings] = useState({
    graceLateMin: 0,
    absentAfterMin: 0,
    earlyLeaveGraceMin: 0,
    checkInWindowBeforeMin: 0,
    checkInWindowAfterMin: 0,
  })
  const [isEditingAttendance, setIsEditingAttendance] = useState(false)
 
  useEffect(() => {
    let mounted = true;
  
    (async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }
  
      try {
        setIsLoading(true);
  
        const res = await fetchInstitution(String(slug));
        if (!mounted) return;
  
        if (!res.ok) {
          toast.error(res.data?.message ?? `Failed to load institution (HTTP ${res.status})`);
          setInstitutionInfo(null);
          setInitialName("");
          return;
        }
  
        setInstitutionInfo(res.data);
        setInitialName(res.data.name);
      } catch {
        if (!mounted) return;
        toast.error("Network error while loading institution.");
        setInstitutionInfo(null);
        setInitialName("");
      } finally {
        if (mounted) setIsLoading(false); // ← only now
      }
    })();
  
    return () => { mounted = false; };
  }, [slug]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (nameCheckTimeoutRef.current) {
        clearTimeout(nameCheckTimeoutRef.current);
      }
    };
  }, []);
  
  const handleSaveInstitutionInfo = async () => {
    // Disable editing mode
    setIsEditing(false);
    setLoading(true); 
    
    if(isNameTaken === true){
      try {
        toast.error("Please change name");
      } catch (error) {
        console.error('Toast error:', error);
      }
      setLoading(false);
      return;
    } 
    
    try {
      if (!institutionInfo) {
        toast.error("Missing institution info");
        setLoading(false);
        return;
      }
        
      const data = await updatedInstitutionInfo(institutionInfo,institutionInfo.slug);
      if (data) {
        console.log('Update response data:', data);
        // Handle successful update
        try {
          toast.success(`Institution updated successfully`);
        } catch (error) {
          console.error('Toast error:', error);
        }
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
        try {
          toast.error(`Failed to update institution`);
        } catch (error) {
          console.error('Toast error:', error);
        }
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
    if (!institutionInfo) {
      toast.error("Missing institution info");
      return;
    }
  
    if (!newSSID || !newMacAddress) {
      toast.error("SSID and MAC are required");
      return;
    }
  
    // نظّف وتحقق من الـ MAC
    const mac = normalizeMacAddress(newMacAddress);
    if (!mac) {
      toast.error("Invalid MAC address. Use format like AA:BB:CC:DD:EE:FF");
      return;
    }
  
    const newEntry = { wifiName: newSSID.trim(), macAddress: mac };
  
    // منع التكرار بحسب MAC (بعد Normalize)
    const currentList: WifiEntry[] = institutionInfo.macAddresses ?? [];
    if (currentList.some(x => x.macAddress === newEntry.macAddress)) {
      toast.warning("This MAC already exists");
      return;
    }
  
    // Snapshot قبل التحديث المتفائل
    const snapshot = institutionInfo;
  
    // تحديث متفائل
    setInstitutionInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        macAddresses: [...(prev.macAddresses ?? []), newEntry],
      };
    });
  
    try {
      // استدعاء API لتحديث المؤسسة
      const updated = await updatedInstitutionInfo(
        {
          ...snapshot,
          macAddresses: [...currentList, newEntry], // أرسل شكل موحّد
        },
        snapshot.slug
      );
  
      if (!updated) {
        // فشل منطقي من السيرفر
        toast.error("Failed to update institution.");
        // Rollback
        setInstitutionInfo(snapshot);
        return;
      }
  
      // نجاح: بعض السيرفرات ترجع macAddresses كنص—وحّد شكلها
      const normalizedList = normalizeMacList((updated ).macAddresses);
  
      setInstitutionInfo(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ...updated,
          macAddresses: normalizedList,
        };
      });
  
      toast.success("Institution updated successfully.");
      setNewSSID('');
      setNewMacAddress('');
    } catch (error) {
      console.error('Error updating institution:', (error as Error).message);
      toast.error('An error occurred while saving. Please try again.');
      // Rollback على أي استثناء
      setInstitutionInfo(snapshot);
    }
  };
  const handleDeleteSSID = async (id: string) => {
    // حماية من null
    if (!institutionInfo) {
      toast.error("Missing institution info");
      return;
    }
  
    // طَبِّع قيمة الماك من الباراميتر (إنت عم تمرر macAddress)
    const targetMac = normalizeMacAddress(id);
    if (!targetMac) {
      toast.error("Invalid MAC address");
      return;
    }
  
    const list: WifiEntry[] = institutionInfo.macAddresses ?? [];
  
    // يجب يبقى واحد على الأقل بعد الحذف
    if (list.length <= 1) {
      toast.error("You must have at least one Wi-Fi network before deleting.");
      return;
    }
  
    // تأكد إنو موجود أصلًا
    if (!list.some(x => x.macAddress === targetMac)) {
      toast.warning("Network not found");
      return;
    }
  
    // Snapshot لِـ rollback
    const snapshot = { ...institutionInfo, macAddresses: [...list] };
  
    // تحديث متفائل
    setInstitutionInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        macAddresses: (prev.macAddresses ?? []).filter(x => x.macAddress !== targetMac),
      };
    });
  
    try {
      // حضّر الداتا المُحدّثة للإرسال
      const payload = {
        ...snapshot,
        macAddresses: snapshot.macAddresses!.filter(x => x.macAddress !== targetMac),
      };
  
      // نادِ API
      const updated = await updatedInstitutionInfo(payload, snapshot.slug);
  
      if (!updated) {
        // فشل منطقي → Rollback
        toast.error("Failed to update institution.");
        setInstitutionInfo(snapshot);
        return;
      }
  
      // بعض السيرفرات ترجع macAddresses كنص—وحّد الشكل
      const normalized = normalizeMacList((updated).macAddresses);
  
      // ثبّت الحالة النهائية
      setInstitutionInfo(prev => {
        if (!prev) return prev;
        return { ...prev, ...updated, macAddresses: normalized };
      });
  
      toast.success("Wi-Fi removed.");
    } catch (e) {
      console.error("Error updating institution:", (e as Error).message);
      toast.error("An error occurred while saving. Please try again.");
      // Rollback عند الاستثناء
      setInstitutionInfo(snapshot);
    }
  };
  

  const handleGenerateNewKey = async () => {
    if (!institutionInfo) {
      toast.error("Missing institution info");
      return;
    }
  
    setIsGenLoading(true);
    const prevKey = institutionInfo.uniqueKey;
  
    try {
      const newKey = await generateInstitutionKey(institutionInfo.id);
      setInstitutionInfo(prev => (prev ? { ...prev, uniqueKey: newKey } : prev));
      toast.success("New key generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error");
      // Rollback on error
      setInstitutionInfo(prev => (prev ? { ...prev, uniqueKey: prevKey } : prev));
    } finally {
      setIsGenLoading(false);
    }
  };

  

const handleDelete = async () => {
  if (!institutionInfo) {
    toast.error('Missing institution info');
    return;
  }
  if (!institutionInfo.adminId) {
    toast.error('Cannot delete: Admin ID is missing.');
    return;
  }

  setDeleteLoading(true);

  try {
    const res = await deleteInstitutionInfo(institutionInfo.slug);

    if (!res.ok) {
      toast.error(res.data?.message ?? `Failed (HTTP ${res.status})`);
      return;
    }

    toast.success(res.data?.message || 'Institution deleted successfully');

    // لو حابب تنتظر 1.2s لعرض التوست
    // await new Promise(r => setTimeout(r, 1200));

    router.push(`/dashboard?adminId=${institutionInfo.adminId}`);
  } catch (error) {
    console.error('Error during deletion:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to delete institution.');
  } finally {
    setDeleteLoading(false);
  }
};


const handleCheckName = () => {
  if (!institutionInfo) {
    setIsNameTaken(null);
    setErrorName('');
    return;
  }

  const name = (institutionInfo.name ?? '').trim();
  const current = (initialName ?? '').trim();

  // ما في اسم أو ما تغيّر
  if (!name || name === current) {
    setIsNameTaken(null);
    setErrorName('');
    if (nameCheckTimeoutRef.current) clearTimeout(nameCheckTimeoutRef.current);
    return;
  }

  // الغِ أي تايمر سابق
  if (nameCheckTimeoutRef.current) clearTimeout(nameCheckTimeoutRef.current);

  setLoading(true);

  const myReqId = ++reqIdRef.current; // رقم طلب لهالدعوة
  nameCheckTimeoutRef.current = setTimeout(async () => {
    try {
      // احتمال تكون الدالة القديمة:
      //   (name: string, adminId: number) => Promise<boolean | string>
      // أو الجديدة:
      //   Promise<ApiSuccess<{exists:boolean}> | ApiFailure>
      const res = await checkNameExists(name, institutionInfo.adminId);

      // تجاهل النتيجة إذا صار طلب أحدث بعده
      if (myReqId !== reqIdRef.current) return;

      if (typeof res === 'boolean') {
        setIsNameTaken(res);
        setErrorName('');
      } else if (typeof res === 'string') {
        setIsNameTaken(null);
        setErrorName(res);
      } else if (res && typeof res === 'object' && 'ok' in res) {
        // نمط الاتحاد ApiResult
        const r = res as ApiSuccess<{ exists: boolean }> | ApiFailure;
        if (!r.ok) {
          setIsNameTaken(null);
          setErrorName(r.data?.message ?? `Failed (HTTP ${r.status})`);
        } else {
          setIsNameTaken(r.data.exists);
          setErrorName('');
        }
      } else {
        // fallback
        setIsNameTaken(null);
        setErrorName('Unexpected response');
      }
    } catch {
      setIsNameTaken(null);
      setErrorName('Error checking name availability');
    } finally {
      // تجاهل إطفاء اللودينغ لو تم تجاوزه بطلب أحدث
      if (myReqId === reqIdRef.current) setLoading(false);
    }
  }, 600); // debounce 600ms (عدّلها لو بدك)
};

const confirmDeletion = async () => {
  if (!institutionInfo) {
    toast.error('No institution loaded.');
    return;
  }
  const expected = (institutionInfo.name ?? '').trim();
  const provided = (inputName ?? '').trim();
  if (provided !== expected) {
    toast.error('Name does not match. Please type the exact institution name to confirm.');
    return;
  }
  await handleDelete(); 
  };

const handleSaveAttendanceSettings = async () => {
  try {
    setIsLoading(true)
    console.log("Saving attendance settings:", attendanceSettings)
    setIsEditingAttendance(false)
  } catch (error) {
    console.error("Error saving attendance settings:", error)
  } finally {
    setIsLoading(false)
  }
}

  if (isLoading) {
    return <div className="flex items-center justify-center">Loading…</div>;
  }
  
  if (!institutionInfo) {
    return <div className="p-4 text-sm text-red-600">Failed to load institution.</div>;
  }
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
              onClick={handleGenerateNewKey} disabled={isGenLoading}
              className="mt-3 sm:mt-0 flex items-center px-4 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800"
            >
              {isGenLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {isGenLoading ? "Generating..." : "Generate"}
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
{/* Check In Window After Minutes */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Check In Window After (Minutes)
  </label>
  {isEditingAttendance ? (
    <input
      type="number"
      min="0"
      value={attendanceSettings.checkInWindowAfterMin}
      onChange={(e) =>
        setAttendanceSettings({
          ...attendanceSettings,
          checkInWindowAfterMin: Number.parseInt(e.target.value) || 0,
        })
      }
      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    />
  ) : (
    <p className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-800">
      {attendanceSettings.checkInWindowAfterMin} minutes
    </p>
  )}
</div>

{/* Save Button */}
{isEditingAttendance && (
  <div className="pt-4">
    <button
      onClick={handleSaveAttendanceSettings}
      className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
    >
      <div className="flex items-center justify-center">
        <Save className="w-4 h-4 mr-2" />
        Save Attendance Settings
      </div>
    </button>
  </div>
)}

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
                    disabled={inputName !== institutionInfo.name || deleteLoading}
                    onClick={confirmDeletion}
                    className="px-4 py-2"
                  >
                    {deleteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    {deleteLoading ? 'Deleting...' : 'Delete'}
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

      </div>

    </div>
  );
};

export default SettingsPage;
