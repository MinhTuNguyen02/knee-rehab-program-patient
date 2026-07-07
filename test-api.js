const API_URL = 'http://localhost:3001';
async function test() {
    const res = await fetch(API_URL + '/patient-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password' })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
}
test();
