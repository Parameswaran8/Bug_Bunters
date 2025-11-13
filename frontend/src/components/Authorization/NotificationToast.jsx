export function NotificationToast({ notification }) {
  if (!notification) return null

  const bgColor = notification.type === "success" ? "bg-green-500" : "bg-red-500"

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>{notification.message}</div>
    </div>
  )
}
