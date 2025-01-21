const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
export const sendNotification = async (userId, message) => {
    try {
      const response = await fetch(`${BaseUrl}/api/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, message }),
      });
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };