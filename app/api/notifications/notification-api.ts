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
export async function fetchNotifications<T = unknown>(orgSlug: string): Promise<T[]> {
  try {
    const res = await fetch(`${BaseUrl}/institutions/${orgSlug}/api/notifications`, {
      credentials: 'include',
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export const sendNotifiyUser = async (userId: string, title: string, message: string, orgSlug: string) => {
  try {
    return await fetch(`${BaseUrl}/institutions/${orgSlug}/api/send-push-user`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title, message, data: {} }),
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

export const deleteNotification = async (id: number, orgSlug: string) => {
  try {
    return await fetch(`${BaseUrl}/institutions/${orgSlug}/api/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};
