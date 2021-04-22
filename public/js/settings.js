import axios from 'axios';
import { showAlert } from './alerts';
export const updateData = async (data, type) => {
  const url =
    type === 'user-data'
      ? '/api/v1/users/updateMe'
      : '/api/v1/users/updateMyPassword';
  try {
    const res = await axios.patch(url, data);
    if (res.data.status === 'success') {
      showAlert('success', `${type} Successfully updated`);
      //   location.reload(true);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
