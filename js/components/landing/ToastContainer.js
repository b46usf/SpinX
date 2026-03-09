/**
 * Toast Container Component
 * Toast notifications for landing page
 */

export const ToastContainer = {
  render: () => `<div id="toast-container" class="fixed top-20 right-4 z-50"></div>`,
  
  show: (type, title, message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    const toast = document.createElement('div');
    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg mb-2 animate-slide-right flex items-center gap-3 min-w-[280px]`;
    toast.innerHTML = `<i class="fas fa-${icon}"></i><div><div class="font-semibold text-sm">${title}</div><div class="text-xs opacity-80">${message}</div></div>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};

export default ToastContainer;

