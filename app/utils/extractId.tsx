import jwt from 'jsonwebtoken';

export function extractAdminId(token: string): string | null {
    try {
        // Decode the payload without verifying the signature (not secure for critical uses)
        const decoded = jwt.decode(token) as { _id: string } | null;

        if (decoded && decoded._id) {
            console.log(decoded._id);
            return decoded._id; // Return adminId (_id) if it exists
        }

        return null; // Return null if _id doesn't exist
    } catch (error) {
        console.error("Error decoding token:", error);
        return null; // Return null if there's an error
    }
}
