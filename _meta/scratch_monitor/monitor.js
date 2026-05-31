const CDP = require('chrome-remote-interface');
const fs = require('fs');

async function startMonitor() {
    let client;
    try {
        console.log('Connecting to Chrome on port 9222...');
        const targets = await CDP.List();
        
        // Try to find x-interview tab, or just pick the first page
        let target = targets.find(t => t.url.includes('x-interview.com') && t.type === 'page');
        if (!target) {
            target = targets.find(t => t.type === 'page');
        }
        
        if (!target) {
            console.error('No valid Chrome tab found.');
            return;
        }

        console.log(`Attaching to tab: ${target.title} (${target.url})`);
        client = await CDP({ target });

        const { Network, Page } = client;

        // Enable domains
        await Network.enable();
        await Page.enable();

        fs.writeFileSync('network_log.txt', '--- START MONITORING ---\n');

        Network.requestWillBeSent((params) => {
            if (params.request.url.includes('x-interview.com') && (params.type === 'Fetch' || params.type === 'XHR')) {
                const log = `\n[REQUEST] ${params.request.method} ${params.request.url}\nPayload: ${params.request.postData || 'None'}\n`;
                console.log(log);
                fs.appendFileSync('network_log.txt', log);
            }
        });

        Network.responseReceived((params) => {
            if (params.response.url.includes('x-interview.com') && (params.type === 'Fetch' || params.type === 'XHR')) {
                const log = `[RESPONSE STATUS] ${params.response.url} -> ${params.response.status}\n`;
                fs.appendFileSync('network_log.txt', log);
                
                // Get response body
                Network.getResponseBody({ requestId: params.requestId }).then(body => {
                    fs.appendFileSync('network_log.txt', `[RESPONSE BODY] ${params.response.url}:\n${body.body.substring(0, 1000)}...\n`);
                }).catch(err => {});
            }
        });

        console.log('Monitoring started. Please interact with the website. This script will log all API calls.');
        
        // Wait indefinitely
        await new Promise(() => {});

    } catch (err) {
        console.error(err);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

startMonitor();
