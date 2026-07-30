const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const contracts = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/storefront-event-contracts.json'), 'utf8')
);

const errors = [];
const names = new Set();

for (const event of contracts.events) {
    if (names.has(event.name)) {
        errors.push(`Duplicate storefront event: ${event.name}`);
    }

    names.add(event.name);

    if (!event.name.startsWith('rhino:')) {
        errors.push(`${event.name}: event names must start with 'rhino:'`);
    }

    if (event.status === 'active' && event.description.includes('Future')) {
        errors.push(`${event.name}: active event should not have placeholder future description`);
    }
}

const scriptPath = path.join(ROOT, 'assets/rhino-storefront.js');

if (!fs.existsSync(scriptPath)) {
    errors.push('Missing assets/rhino-storefront.js');
} else {
    const script = fs.readFileSync(scriptPath, 'utf8');

    if (!script.includes('RhinoLapidary')) {
        errors.push('assets/rhino-storefront.js must use the RhinoLapidary namespace.');
    }
}

if (errors.length > 0) {
    console.error('Storefront JS contract validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log(`Storefront JS contract validation passed for ${contracts.events.length} events.`);