import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import util from 'util';

// Load environment variables
dotenv.config();

async function testEndpoints() {
    console.log('🚀 Starting API endpoint tests...\n');

    // Test data for lost item
    const lostItemData = {
        userId: "test-user-1",
        category: "Electronics",
        title: "OnePlus Mobile Phone",
        description: "Black OnePlus phone with black case, last seen at open auditorium",
        lastSeenLocation: "Open Auditorium",
        date: new Date().toISOString(),
        characteristics: {
            color: "Black",
            brand: "OnePlus",
            markings: "Black case",
            additionalDetails: "Has a small scratch on screen"
        },
        status: "pending"
    };

    // Test data for found item
    const foundItemData = {
        userId: "test-user-2",
        category: "Electronics",
        title: "Found OnePlus Phone",
        description: "Black OnePlus phone found at open auditorium",
        foundLocation: "Open Auditorium",
        whereStored: "Security Office",
        date: new Date().toISOString(),
        characteristics: {
            color: "Black",
            brand: "OnePlus",
            markings: "Has a black phone case",
            additionalDetails: "Screen has a minor scratch"
        },
        status: "pending"
    };

    try {
        console.log('📱 Testing Lost Items Endpoint...');
        const lostResponse = await fetch('http://localhost:3001/api/lost-items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lostItemData),
        });

        const lostResult = await lostResponse.json();
        console.log('Lost Item Response:', util.inspect({
            status: lostResponse.status,
            ok: lostResponse.ok,
            data: lostResult
        }, { depth: null, colors: true }));

        console.log('\n📱 Testing Found Items Endpoint...');
        const foundResponse = await fetch('http://localhost:3001/api/found-items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(foundItemData),
        });

        const foundResult = await foundResponse.json();
        console.log('Found Item Response:', util.inspect({
            status: foundResponse.status,
            ok: foundResponse.ok,
            data: foundResult
        }, { depth: null, colors: true }));

    } catch (error) {
        console.error('❌ Error during testing:', error);
    }
}

console.log('🔍 Starting endpoint verification...\n');
testEndpoints().catch(console.error); 