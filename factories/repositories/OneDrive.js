import API from '~/api';
import { apiHelper, objectToQueryString } from '~/helpers/ApiHelper';

const BASE_URL = process.env.API_BASE_URL;
const API_URL = `${BASE_URL}one-drive`;

export default {
  ...apiHelper(API_URL),
  getToken: params => API.get(`${API_URL}/get-access-token?${objectToQueryString(params)}`)
};
