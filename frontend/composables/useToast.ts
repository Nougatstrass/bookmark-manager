
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
    id: number
    type: ToastType
    message: string
    timeout: number
}

const _toasts = ref<ToastItem[]>([])

let _id = 1

function add(type: ToastType, message: string, timeout = 3000) {
    const id = _id++
    const item: ToastItem = { id, type, message, timeout }

    _toasts.value.push(item)

    // Auto-dismiss
    window.setTimeout(() => {
        remove(id)
    }, timeout)

    return id
}

function remove(id: number) {
    _toasts.value = _toasts.value.filter(t => t.id !== id)
}

function clear() {
    _toasts.value = []
}

// Convenience helpers
function success(message: string, timeout?: number) {
    return add('success', message, timeout)
}

function error(message: string, timeout?: number) {
    return add('error', message, timeout)
}

function info(message: string, timeout?: number) {
    return add('info', message, timeout)
}

// Export a singleton-like API
export function useToast() {
    return {
        toasts: _toasts,
        add,
        remove,
        clear,
        success,
        error,
        info
    }
}
