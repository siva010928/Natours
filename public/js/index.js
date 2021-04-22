import '@babel/polyfill';
import { mapMarker } from './mapBox';
import { login, logout } from './login';
import { updateData } from './settings';
import { bookTour } from './stripe';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const checkOutBtn = document.getElementById('book-tour');

if (map) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  mapMarker(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
if (updateUserForm) {
  updateUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-userdata').textContent = 'updating....';
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const formdata = new FormData();
    formdata.append('email', email);
    formdata.append('name', name);
    formdata.append('photo', document.getElementById('photo').files[0]);
    console.log(formdata);
    await updateData(formdata, 'user-data');
    document.querySelector('.btn--save-userdata').textContent = 'Save Settings';
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'updating....';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateData(
      {
        passwordCurrent,
        password,
        passwordConfirm,
      },
      'user-password'
    );
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (checkOutBtn) {
  checkOutBtn.addEventListener('click', (e) => {
    e.target.textContent = 'processing payment...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
