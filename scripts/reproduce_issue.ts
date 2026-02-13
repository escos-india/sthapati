
import fetch from 'node-fetch';

async function reproduce() {
    const url = 'http://localhost:9002/api/auth/register';
    // Use a random email to ensure first creation works (if we wanted to test creation)
    // But here we want to test CONFLICT.
    // I will assume 'test@example.com' might exist or I'll create it twice.

    const user = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        category: 'Job Seeker',
        phone: `99${Date.now().toString().slice(-8)}` // Random phone
    };

    console.log('Attempting first registration...');
    const res1 = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });

    const data1 = await res1.json();
    console.log(`Response 1: ${res1.status}`, data1);

    if (res1.status === 201) {
        console.log('First registration successful. Attempting duplicate registration...');
        const res2 = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data2 = await res2.json();
        console.log(`Response 2: ${res2.status}`, data2);

        if (res2.status === 409) {
            console.log('SUCCESS: API correctly returned 409 Conflict for duplicate user.');
            console.log('Message:', data2.message);
        } else {
            console.log('FAILURE: API did not return 409 for duplicate user.');
        }
    } else {
        console.log('First registration failed. Maybe user already exists?');
        // If first failed with 409, then we effectively reproduced it too.
        if (res1.status === 409) {
            console.log('SUCCESS: API returned 409 (User likely already existed from previous run).');
        }
    }
}

reproduce().catch(console.error);
