
import { normalizeInstitution, InstitutionInfo } from "@/app/types/Institution";
import { toast } from "react-toastify";
// Generate New Key
const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
const isBrowser = typeof window !== "undefined";
import { apiGet, ApiFailure, ApiSuccess, ApiError } from '@/app/lib/api';

export interface AttendanceSettings {
  graceLateMin: number;
  absentAfterMin: number;
  earlyLeaveGraceMin: number;
  checkInWindowBeforeMin: number;
  checkInWindowAfterMin: number;
}

// 2) لو PATCH جزئي خلّيه Partial
export type AttendanceSettingsPatch = Partial<AttendanceSettings>;



export const copyToClipboard = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text); // Copy text to clipboard
        toast.info('Copied to clipboard!', {
          autoClose: 2500 // duration in milliseconds
        }); // Log success message
    } catch (err) {
        toast.error(`Failed to copy! ${err} `); // Log error
        throw new Error('Failed to copy!');
         // Optionally throw an error
    }
};
export const fetchInstitutionById = async (id: string) => {
  try {
    const response = await fetch(`${BaseUrl}/ins/institutions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensure cookies (including the token) are sent
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error('Failed to fetch institution');
    }

    // Parse the response data
    const data = await response.json();
    return data; // Return the fetched institution data
  } catch (error) {
    console.error('Error fetching institution:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const fetchInstitutions = async () => {
  try {
    const response = await fetch(`${BaseUrl}/ins/institutions`, {
      method: 'GET',
      headers: {
         // Include token if needed
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch institutions');
    }

    const data = await response.json();
    return(data); // Set the fetched institutions
    
  } catch (error) {
    toast.error(`Error fetching institutions: ${error}` );
  }
};
export const getLocalStorageItem = (key: string) => {
  if (isBrowser) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error getting localStorage:", error);
      return null;
    }
  }
  return null; // Return null if not in browser
};

export const fetchInstitutionsByAdmin = async () => {
    const response = await fetch(`${BaseUrl}/rbac/admin-institutions`, { // Include the ID in the URL
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', 

    });
    if (!response.ok) {
      throw new Error('Failed to fetch institution');
    }
  
    const data = await response.json();
    console.log("data fetchInstitutionsByAdmin",data);
    return data; // Return the fetched institution data
  };

  export async function fetchInstitution(slug: string): Promise<
  | ApiSuccess<InstitutionInfo>
  | ApiFailure
> {
  const result = await apiGet<InstitutionInfo>(`${BaseUrl}/ins/institutions/slug/${slug}`);
  if (!result.ok) return result;

  const normalized = normalizeInstitution(result.data);
  return { ...result, data: normalized };
}
export const updatedInstitutionInfo = async (institutionInfo: InstitutionInfo,slug: string ) => {
  // Create the data to send
  const institutionData = {
    name: institutionInfo.name,
    adminId: institutionInfo.adminId,
    address: institutionInfo.address,
    keyNumber: institutionInfo.uniqueKey,
    macAddresses: institutionInfo.macAddresses,
    slug: slug // array of MAC addresses

  };
  console.log(institutionData)
  try {
    const response = await fetch(`${BaseUrl}/ins/institutions/${slug}`, {
      method: 'PUT',
      headers: {
        
        'Content-Type': 'application/json',
        // Include any necessary authentication headers here
      },
      
      body: JSON.stringify(institutionData), 
      credentials: 'include', // Send the updated institution info
    });

    if (!response.ok) {
      throw new Error('Failed to update institution');
    }

    const updatedInstitution = await response.json();
    console.log('Updated Institution:', updatedInstitution);
    return updatedInstitution;
    // Exit editing mode after successful update
  } catch (error) {
    console.error('Error updating institution info:', error);
  }
}
export const deleteInstitutionInfo = async (slug: string ) => {

    const res = await fetch(`${BaseUrl}/ins/institutions/${slug}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json().catch(() => null) : null;
    if (res.ok) {
      return { ok: true, status: res.status, data: (body ?? { message: 'Institution deleted successfully' }), res };
    }
    return { ok: false, status: res.status, data: (body as ApiError) ?? null, res };
  
}

export const generateInstitutionKey = async (institutionId: number): Promise<string> => {
  try {
    const response = await fetch(`${BaseUrl}/ins/institutions/${institutionId}/generate-key`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `Failed to generate key (HTTP ${response.status})`);
    }

    const newKey = data?.uniqueKey ?? data?.institution?.uniqueKey ?? data?.data?.uniqueKey;
    
    if (!newKey) {
      throw new Error("Server did not return a new key");
    }

    return newKey;
  } catch (error) {
    console.error('Error generating institution key:', error);
    throw error;
  }
};

export async function checkNameExists(
  name: string,
  adminId: number
): Promise<ApiSuccess<{ exists: boolean }> | ApiFailure> {
  const url = `${BaseUrl}/ins/institutions/check-name?name=${encodeURIComponent(name)}&adminId=${adminId}`;
  const res = await fetch(url, { credentials: 'include' });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (res.ok) {
    // توقّع { exists: true/false }
    return { ok: true, status: res.status, data: (body as { exists: boolean }), res };
  }
  return { ok: false, status: res.status, data: (body as ApiError) ?? null, res };
}


export const updateAttendanceSettings = async (slug: string, settings: AttendanceSettingsPatch) => {
  const response = await fetch(`${BaseUrl}/institutions/${slug}/settings`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Failed to update attendance settings");
  return response.json();
}
