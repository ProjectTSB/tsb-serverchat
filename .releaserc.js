module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md'
            }
        ],
        '@semantic-release/npm',
        [
            '@semantic-release/git',
            {
                assets: [
                    'package.json',
                    'CHANGELOG.md'
                ]
            }
        ]
    ],
    branches: [
        'master'
    ]
};
