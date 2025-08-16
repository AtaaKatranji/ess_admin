
import { toast } from "react-toastify";
// Generate New Key
const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
const isBrowser = typeof window !== "undefined";
 
interface SSIDInfo {
  
  wifiName: string;
  macAddress: string;

}

type InstitutionInfo = {
  name: string;
  adminId: string;
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[];
}


export function GenerateKey(){
    try {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    catch {

    }
}
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
export const fetchInstitutionsByAdmin = async (adminId: string) => {
    console.log("hey fucker")
    
    const response = await fetch(`${BaseUrl}/rbac/admin-institutions`, { // Include the ID in the URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', 
      body: JSON.stringify({ adminId }),
    });
    console.log("5: ",response)
    if (!response.ok) {
      throw new Error('Failed to fetch institution');
    }
  
    const data = await response.json();
    return data; // Return the fetched institution data
  };
export  const fetchInstitution = async (slug: string) => {
  try {
    console.log("fetching...\n")
    const response = await fetch(`${BaseUrl}/ins/institutions/slug/${slug}`, {
      method: 'GET',
      headers: {
         // Include token if needed
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
    });
    if (!response.ok) {
      throw new Error('Failed to fetch institution');
    }

    const data = await response.json();
    if (typeof data.macAddresses === "string") {
      data.macAddresses = JSON.parse(data.macAddresses);
    }
    return(data);
      // Set institution data
  } catch (error) {
    toast.error(`Error fetching institution: ${error}` );
  } 
};
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
  
  try {
    const response = await fetch(`${BaseUrl}/ins/institutions/${slug}`, {
      method: 'DELETE',
      headers: {
        
        'Content-Type': 'application/json',
        // Include any necessary authentication headers here
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error('Failed to update institution');
    }
    const res = await response.json()
    return await res.message;
     
    // Exit editing mode after successful update
  } catch (error) {
    console.error('Error updating institution info:', error);
  }
}

export const checkNameExists = async (name: string,adminId: string) => {
  try {
    // Replace this URL with your actual API endpoint
    const insData = {adminId,name}
    const response = await fetch(`${BaseUrl}/ins/check-name`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(insData),
      credentials: 'include', 
    });
    // Assume the API returns a boolean indicating if the name exists
    const data = await  response.json()
    console.log(data)
    console.log(data.exists)
    if (data.exists == true) {
      return(true); // name is taken
    } else {
      return(false); // name is available
    }
  } catch (error) {
    console.error('Error checking name:', error);
  }
};
