const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
export const sendNotifiy = async (shiftId, title,message) => {
    try {
      return await fetch(`${BaseUrl}/api/send-push-shift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shiftId, title, message, data:{} }),
      });
  
      
    } catch (error) {
      console.error('Error:', error);
    }
  };


