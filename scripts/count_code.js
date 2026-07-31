const fs = require('fs');
const path = require('path');

const repositories = [
    {
        name: 'frontend',
        path: path.resolve('repos/frontend/src')
    },
    {
        name: 'backend',
        path: path.resolve('repos/backend/src')
    }
];

const allowedExtensions = new Set([
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.css',
    '.scss',
    '.html'
]);

const ignoredDirectories = new Set([
    'node_modules',
    'dist',
    'build',
    '.git'
]);

function countDirectory(directory) {
    let files = 0;
    let lines = 0;

    if (!fs.existsSync(directory)) {
        return {
            files,
            lines
        };
    }

    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {
            if (ignoredDirectories.has(entry.name)) {
                continue;
            }

            const result = countDirectory(fullPath);

            files += result.files;
            lines += result.lines;

            continue;
        }

        const extension = path.extname(entry.name);

        if (!allowedExtensions.has(extension)) {
            continue;
        }

        const content = fs.readFileSync(
            fullPath,
            'utf8'
        );

        const fileLines = content === ''
            ? 0
            : content.split(/\r?\n/).length;

        files++;
        lines += fileLines;
    }

    return {
        files,
        lines
    };
}


// =========================
// CODE STATISTICS
// =========================

const stats = {
    frontend: countDirectory(
        repositories[0].path
    ),

    backend: countDirectory(
        repositories[1].path
    )
};


// =========================
// TOTAL
// =========================

stats.total = {
    files:
        stats.frontend.files +
        stats.backend.files,

    lines:
        stats.frontend.lines +
        stats.backend.lines
};


// =========================
// FIRST ACTION
// =========================

stats.firstAction =
    process.env.FIRST_ACTION || null;


// =========================
// COMMITS
// =========================

stats.commits = Number(
    process.env.TOTAL_COMMITS || 0
);


// =========================
// UPDATED AT
// =========================

stats.updatedAt =
    new Date().toISOString();


// =========================
// WRITE JSON
// =========================

const outputPath =
    path.resolve('code-stats.json');

fs.writeFileSync(
    outputPath,
    JSON.stringify(stats, null, 2) + '\n'
);


// =========================
// CONSOLE
// =========================

console.log('Code statistics:');

console.log(
    JSON.stringify(
        stats,
        null,
        2
    )
);