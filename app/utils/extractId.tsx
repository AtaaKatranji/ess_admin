import jwt from 'jsonwebtoken';

export function extractAdminId(token: string): string | null {
   if(token){
    try {
        // Decode the payload without verifying the signature (not secure for critical uses)
        const decoded = jwt.decode(token) as { id: string } | null;

        if (decoded && decoded.id) {
            console.log(decoded.id);
            return decoded.id; // Return adminId (_id) if it exists
        }

        return null; // Return null if _id doesn't exist
    } catch (error) {
        console.error("Error decoding token:", error);
        return null; // Return null if there's an error
    }
   }
   console.error("No token provided");
   return null; // Return null if no token is provided

}
