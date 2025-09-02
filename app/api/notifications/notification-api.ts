const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
export const sendNotifiy = async (shiftId: string, title: string, message: string, orgSlug: string) => {
    try {
      return await fetch(`${BaseUrl}/institutions/${orgSlug}/api/send-push-shift`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shiftId, title, message, data:{} }),
      });
  
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  export async function canSendNotification(slug: string): Promise<boolean> {
    const res = await fetch(
      `${BaseUrl}/rbac/permissions/can/notification.send?${slug}`,
      { credentials: "include" }
    );
  
    // غير مصدّق؟
    if (res.status === 401) return false;
  
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return !!data.allowed;
  }

