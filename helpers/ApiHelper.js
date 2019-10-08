import API from '~/api/';

export const objectToQueryString = (object) => {
  delete object.$url;

  if (typeof object === 'object') {
    const str = [];
    Object.keys(object).forEach((key) => {
      const field = object[key];
      str.push(`${encodeURIComponent(key)}=${encodeURIComponent(field)}`);
    });
    return str.join('&');
  }

  return '';
};

export const apiHelper = apiUrl => ({
  getWithParams: params => API.get(`${apiUrl}`, { params }),
  get: (id = '') => API.get(`${apiUrl}/${id}`),
  store: (payload, headers = {}) => API.post(`${apiUrl}`, payload, { headers }),
  update: (id, payload, headers = {}) => API.put(`${apiUrl}/${id}`, payload, { headers }),
  patch: (id, payload) => API.patch(`${apiUrl}/${id}`, payload),
  destroy: id => API.delete(`${apiUrl}/${id}`),
  updateOrCreate: (params, headers = {}) => {
    if (params.id) {
      return API.put(`${apiUrl}/${params.id}`, params, { headers });
    }

    return API.post(`${apiUrl}`, params, { headers });
  },
});

export default apiHelper;
