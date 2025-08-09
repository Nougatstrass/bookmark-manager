export const useApi = () => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const $get = <T>(path: string, opts?: Parameters<typeof $fetch>[1]) =>
    $fetch<T>(`${apiBase}${path}`, { ...opts });

  const $post = <T>(path: string, body?: any, opts?: Parameters<typeof $fetch>[1]) =>
    $fetch<T>(`${apiBase}${path}`, { method: 'POST', body, ...opts });

  const $put = <T>(path: string, body?: any, opts?: Parameters<typeof $fetch>[1]) =>
    $fetch<T>(`${apiBase}${path}`, { method: 'PUT', body, ...opts });

  const $del = <T>(path: string, opts?: Parameters<typeof $fetch>[1]) =>
    $fetch<T>(`${apiBase}${path}`, { method: 'DELETE', ...opts });

  return { $get, $post, $put, $del };
};
