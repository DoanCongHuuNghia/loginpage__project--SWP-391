// button chuyển đổi sign in, sign up trên pc
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
// button chuyển đổi sign in, sign up trên tablet and mobile
const signUpButtontm = document.getElementById('signUp-t-m');
const signInButtontm = document.getElementById('signIn-t-m');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right__panel--active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right__panel--active");
});

signUpButtontm.addEventListener('click', () => {
	container.classList.add("right__panel-t-m--active");
});

signInButtontm.addEventListener('click', () => {
	container.classList.remove("right__panel-t-m--active");
});


