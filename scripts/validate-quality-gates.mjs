const requiredGates = [
    'ai-slop',
    'ponytail',
    'over-engineering',
    'framework-patterns',
];

const body = process.env.PR_BODY ?? '';
const lines = body.split(/\r?\n/);
const failures = [];

for (const gate of requiredGates) {
    const gatePrefix = new RegExp(`^\\s*-\\s*\\[[ xX]\\]\\s*\\*\\*${gate}\\*\\*\\s*\\|`, 'i');
    const gateLines = lines.filter(line => gatePrefix.test(line));

    if (gateLines.length !== 1) {
        failures.push(`${gate}: expected exactly one checklist entry, found ${gateLines.length}.`);
        continue;
    }

    const line = gateLines[0];
    if (!/^\s*-\s*\[[xX]\]/.test(line)) {
        failures.push(`${gate}: checklist entry is not checked.`);
    }

    if (!/\bOutcome:\s*PASS\b/i.test(line)) {
        failures.push(`${gate}: outcome must be PASS.`);
    }

    const evidence = line.match(/\bEvidence:\s*(.+)$/i)?.[1]?.trim();
    if (!evidence || evidence.length < 12 || /^(todo|tbd|pending|n\/?a|describe\b|<)/i.test(evidence)) {
        failures.push(`${gate}: add specific, non-placeholder evidence.`);
    }
}

if (failures.length > 0) {
    console.error('PR quality gate attestation is incomplete:');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exitCode = 1;
} else {
    console.log('All four quality gate results are checked, passing, and include evidence.');
}