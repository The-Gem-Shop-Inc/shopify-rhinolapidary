'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const DECISION_PATH = path.join(ROOT, 'data', 'localization-market-decision.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'localization-market-decision.schema.json');
const HEADER_GROUP_PATH = path.join(ROOT, 'sections', 'header-group.json');
const FOOTER_GROUP_PATH = path.join(ROOT, 'sections', 'footer-group.json');

const INTERNATIONAL_CLAIM_PATTERN = /\b(?:ships worldwide|available worldwide|international shipping|international warranty|worldwide support|all countries|voltage compatible)\b/i;

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sectionSettings(filePath, sectionId) {
    const data = readJson(filePath);
    return data.sections?.[sectionId]?.settings || {};
}

function validateLocalizationMarketSafety(decision) {
    const errors = [];

    if (fs.existsSync(SCHEMA_PATH)) {
        const ajv = new Ajv2020({
            allErrors: true,
            strict: false,
        });
        const validate = ajv.compile(readJson(SCHEMA_PATH));

        if (!validate(decision)) {
            for (const error of validate.errors || []) {
                errors.push(`schema ${error.instancePath || '/'} ${error.message}`);
            }
        }
    }

    const header = sectionSettings(HEADER_GROUP_PATH, 'header');
    const footer = sectionSettings(FOOTER_GROUP_PATH, 'footer');

    if (
        decision.themeSelectorSettings.header.enableCountrySelector
        !== header.enable_country_selector
    ) {
        errors.push('Header country selector setting does not match the decision artifact.');
    }

    if (
        decision.themeSelectorSettings.header.enableLanguageSelector
        !== header.enable_language_selector
    ) {
        errors.push('Header language selector setting does not match the decision artifact.');
    }

    if (
        decision.themeSelectorSettings.footer.enableCountrySelector
        !== footer.enable_country_selector
    ) {
        errors.push('Footer country selector setting does not match the decision artifact.');
    }

    if (
        decision.themeSelectorSettings.footer.enableLanguageSelector
        !== footer.enable_language_selector
    ) {
        errors.push('Footer language selector setting does not match the decision artifact.');
    }

    if (
        decision.decision.visibleInternationalWordingApproved === false
        && decision.decision.approvedInternationalWording.length > 0
    ) {
        errors.push('International wording cannot be listed while visibleInternationalWordingApproved is false.');
    }

    if (
        decision.decision.visibleInternationalWordingApproved === false
        && INTERNATIONAL_CLAIM_PATTERN.test(
            decision.decision.approvedInternationalWording.join(' '),
        )
    ) {
        errors.push('Decision artifact contains unapproved international availability wording.');
    }

    if (
        decision.adminEvidence.publishedLanguages.length <= 1
        && !['conditional_shopify_rendered_only', 'disabled'].includes(
            decision.decision.languageSelectorLaunchState,
        )
    ) {
        errors.push('Single-language evidence requires conditional or disabled language-selector state.');
    }

    if (
        decision.adminEvidence.enabledPresentmentCurrencies.length <= 1
        && !['conditional_shopify_rendered_only', 'disabled'].includes(
            decision.decision.countrySelectorLaunchState,
        )
    ) {
        errors.push('Single-currency evidence requires conditional or disabled country-selector state.');
    }

    return errors;
}

function main() {
    const decision = readJson(DECISION_PATH);
    const errors = validateLocalizationMarketSafety(decision);

    if (errors.length > 0) {
        console.error('Localization market safety validation failed.');

        for (const error of errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
    }

    console.log(
        `Localization market safety valid: `
        + `${decision.adminEvidence.enabledPresentmentCurrencies.length} presentment currency, `
        + `${decision.adminEvidence.publishedLanguages.length} published language.`,
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    validateLocalizationMarketSafety,
};
