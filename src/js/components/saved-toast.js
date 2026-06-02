let _toastTimeout = null;

export function renderSavedToast(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div id="savedToast"
             class="fixed bottom-10 left-1/2 -translate-x-1/2 translate-y-4 opacity-0
                    bg-[#141414] border border-[#2a2a2a] rounded-xl px-10 py-4
                    pointer-events-none z-[80] transition-all duration-300 ease-out">
            <p class="font-serif text-xl italic font-semibold text-yellow-500 whitespace-nowrap">
                Clip Saved!
            </p>
        </div>
    `;
}

export function showSavedToast(duration = 2500) {
    const toast = document.getElementById('savedToast');
    if (!toast) return;

    // Clear any running timeout
    if (_toastTimeout) clearTimeout(_toastTimeout);

    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    _toastTimeout = setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        toast.classList.remove('opacity-100', 'translate-y-0');
        _toastTimeout = null;
    }, duration);
}
