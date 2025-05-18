export async function getCsrfToken() {
const response = await fetch('http://localhost:8000/get-csrf-token/', {
		credentials: 'include'
	});
	const { csrfToken } = await response.json();
	return csrfToken;
}