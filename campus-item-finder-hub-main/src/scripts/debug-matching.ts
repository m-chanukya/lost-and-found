import { PrismaClient } from '@prisma/client';
import { MatchingService } from '../services/matchingService';
import { DatabaseService } from '../services/databaseService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function debugMatching() {
    try {
        console.log('🔍 Finding items to compare...\n');
        
        // Get all items without any filters
        const lostItems = await prisma.lostItem.findMany({
            include: {
                user: true
            }
        });

        const foundItems = await prisma.foundItem.findMany({
            include: {
                user: true
            }
        });

        console.log('All Items in Database:');
        console.log('\nLost Items:');
        lostItems.forEach(item => {
            console.log(`- ${item.title} (Category: ${item.category})`);
        });

        console.log('\nFound Items:');
        foundItems.forEach(item => {
            console.log(`- ${item.title} (Category: ${item.category})`);
        });

        console.log(`\nTotal: ${lostItems.length} lost items and ${foundItems.length} found items\n`);

        // Filter for mobile items
        const mobileLostItems = lostItems.filter(item => 
            item.title.toLowerCase().includes('mobile') || 
            item.title.toLowerCase().includes('phone') ||
            item.category === 'Electronics'
        );

        const mobileFoundItems = foundItems.filter(item => 
            item.title.toLowerCase().includes('mobile') || 
            item.title.toLowerCase().includes('phone') ||
            item.category === 'Electronics'
        );

        console.log(`Found ${mobileLostItems.length} lost mobiles/electronics and ${mobileFoundItems.length} found mobiles/electronics\n`);

        // Compare each lost item with each found item
        for (const lostItem of mobileLostItems) {
            console.log(`\n📱 Analyzing lost item: "${lostItem.title}"`);
            console.log('Description:', lostItem.description);
            console.log('Location:', lostItem.lastSeenLocation);
            
            const lostItemWithCharacteristics = DatabaseService.mapItemCharacteristics(lostItem);

            for (const foundItem of mobileFoundItems) {
                console.log(`\nComparing with found item: "${foundItem.title}"`);
                console.log('Description:', foundItem.description);
                console.log('Location:', foundItem.foundLocation);

                const foundItemWithCharacteristics = DatabaseService.mapItemCharacteristics(foundItem);

                // @ts-ignore - accessing private method for debugging
                const confidence = MatchingService['calculateMatchConfidence'](
                    lostItemWithCharacteristics,
                    foundItemWithCharacteristics
                );

                console.log('\nSimilarity Scores:');
                // @ts-ignore - accessing private method for debugging
                const titleSimilarity = MatchingService['calculateTitleSimilarity']?.(
                    lostItemWithCharacteristics,
                    foundItemWithCharacteristics
                ) || 'N/A';
                // @ts-ignore - accessing private method for debugging
                const descriptionSimilarity = MatchingService['calculateDescriptionSimilarity']?.(
                    lostItemWithCharacteristics,
                    foundItemWithCharacteristics
                ) || 'N/A';
                // @ts-ignore - accessing private method for debugging
                const locationSimilarity = MatchingService['calculateLocationSimilarity']?.(
                    lostItemWithCharacteristics,
                    foundItemWithCharacteristics
                ) || 'N/A';

                console.log('- Title Similarity:', titleSimilarity);
                console.log('- Description Similarity:', descriptionSimilarity);
                console.log('- Location Similarity:', locationSimilarity);
                console.log('- Overall Confidence:', confidence);
                console.log(`- Would Match: ${confidence >= 0.6 ? 'YES ✅' : 'NO ❌'}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

console.log('🚀 Starting matching debug...\n');
debugMatching().catch(console.error); 