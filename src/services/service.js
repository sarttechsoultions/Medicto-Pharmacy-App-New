export const base_api = 'https://medictopharmacy.com/'
export const BASE_URL = 'https://medictopharmacy.com/api';


let authToken = null;

export const setApiToken = (token) => {
  authToken = token;
};

const request = async (
  endpoint,
  method = 'GET',
  body = null
) => {
  try {
    // console.log('token os----------- ', authToken);
    
    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
         
          ...(authToken && {
            Authorization: `Bearer ${authToken}`,
          }),
        },

        ...(body && {
          body: JSON.stringify(body),
        }),
      }
    );

    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
};

export const api = {
  get: (url) => request(url),

  post: (url, body) =>
    request(url, 'POST', body),

  put: (url, body) =>
    request(url, 'PUT', body),

  delete: (url) =>
    request(url, 'DELETE'),
};