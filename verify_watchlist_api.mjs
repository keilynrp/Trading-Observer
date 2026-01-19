
async function testWatchlistAPI() {
    const baseUrl = 'http://127.0.0.1:3000/api/watchlists';

    console.log(`Connecting to ${baseUrl}...`);

    console.log('--- Testing GET /api/watchlists ---');
    try {
        const res = await fetch(baseUrl);
        if (res.ok) {
            const data = await res.json();
            console.log('GET Success. Count:', data.length);
            console.log('First Item:', data[0]?.name);
        } else {
            console.error('GET Failed:', res.status, await res.text());
        }
    } catch (e) {
        console.error('GET Error:', e.cause?.code || e.message);
    }

    console.log('\n--- Testing POST /api/watchlists ---');
    try {
        const newWatchlist = {
            name: "Test List " + Date.now(),
            description: "Automated test list",
            symbols: ["TEST", "AUTO"],
            isPublic: false,
            userId: "1",
            username: "tester"
        };

        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newWatchlist)
        });

        if (res.ok) {
            const data = await res.json();
            console.log('POST Success. Created ID:', data.id);
            console.log('Created Name:', data.name);

            // Cleanup
            console.log('\n--- Testing DELETE /api/watchlists/[id] ---');
            const deleteUrl = `${baseUrl}/${data.id}`;
            const delRes = await fetch(deleteUrl, { method: 'DELETE' });
            if (delRes.ok) {
                console.log('DELETE Success.');
            } else {
                console.error('DELETE Failed:', delRes.status);
            }

        } else {
            console.error('POST Failed:', res.status, await res.text());
        }
    } catch (e) {
        console.error('POST Error:', e.cause?.code || e.message);
    }
}

testWatchlistAPI();
