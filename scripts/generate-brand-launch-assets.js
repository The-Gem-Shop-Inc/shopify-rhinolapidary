'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SPEC_PATH = path.join(ROOT, 'data', 'brand-launch-assets.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function resolveProjectPath(relativePath) {
    return path.resolve(ROOT, relativePath);
}

function ensureParentDirectory(filePath) {
    fs.mkdirSync(path.dirname(filePath), {
        recursive: true
    });
}

async function renderSquareAsset({
    sourcePath,
    outputPath,
    width,
    height,
    background,
}) {
    ensureParentDirectory(outputPath);

    await sharp(sourcePath, {
        density: 384,
    })
        .resize({
            width,
            height,
            fit: 'contain',
            background,
            withoutEnlargement: false,
        })
        .png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true,
        })
        .toFile(outputPath);
}

async function renderDefaultSocialImage({
    sourcePath,
    outputPath,
    width,
    height,
    background
}) {
    ensureParentDirectory(outputPath);

    const logoWidth = Math.round(width * 0.7);
    const logoHeight = Math.round(height * 0.42);

    const logo = await sharp(sourcePath, {
        density: 300,
    })
        .resize({
            width: logoWidth,
            height: logoHeight,
            fit: 'inside',
            withoutEnlargement: false,
        })
        .png()
        .toBuffer();

    const logoMetadata = await sharp(logo).metadata();

    const logoLeft = Math.round(
        (width - (logoMetadata.width || logoWidth)) / 2,
    );

    const logoTop = Math.round(
        (height - (logoMetadata.height || logoHeight)) / 2,
    );

    const accent = Buffer.from(`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
        >
            <rect
                x="${Math.round(width * 0.15)}"
                y="${Math.round(height * 0.82)}"
                width="${Math.round(width * 0.7)}"
                height="8"
                rx="4"
                fill="#B51820"
            />
        </svg>
    `);

    await sharp({
        create: {
            width,
            height,
            channels: 3,
            background,
        },
    })
        .composite([
            {
                input: logo,
                left: logoLeft,
                top: logoTop,
            },
            {
                input: accent,
                left: 0,
                top: 0,
            },
        ])
        .jpeg({
            quality: 88,
            chromaSubsampling: '4:4:4',
            mozjpeg: true,
        })
        .toFile(outputPath);
}

async function main() {
    const spec = readJson(SPEC_PATH);

    if (spec.schemaVersion !== 1) {
        throw new Error(`Unsupported brand asset schema version: ${spec.schemaVersion}`);
    }

    for (const output of spec.outputs) {
        const sourceKey = output.source;
        const sourceRelativePath = spec.sources[sourceKey];

        if (!sourceRelativePath) {
            throw new Error(`Output "${output.id}" references unknown source "${sourceKey}".`);
        }

        const sourcePath = resolveProjectPath(sourceRelativePath);
        const outputPath = resolveProjectPath(output.path);

        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Missing source for "${output.id}": ${sourceRelativePath}`);
        }

        if (output.id === 'default-social-image') {
            await renderDefaultSocialImage({
                sourcePath,
                outputPath,
                width: output.width,
                height: output.height,
                background: output.background
            });
        } else {
            await renderSquareAsset({
                sourcePath,
                outputPath,
                width: output.width,
                height: output.height,
                background: output.background
            });
        }

        console.log(`Generated ${output.path}`);
    }
}

main().catch((error) => {
    console.error(`Brand asset generation failed:\n${error.stack || error.message}`);

    process.exitCode = 1;
});
