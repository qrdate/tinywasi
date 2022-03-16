module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['*.cjs'],
    overrides: [
        {
            files: ['*.ts'],
            rules: {
                'no-undef': 'off',
            },
        },
    ],
    settings: {},
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
    },
    env: {
        browser: true,
        es2017: true,
        node: true,
    },
    rules: {
        quotes: ['warn', 'single'],
        'array-callback-return': [
            'error',
            {
                allowImplicit: true,
            },
        ],
        'no-extra-semi': 2,
        eqeqeq: 2,
        'no-undef': 2,
        'no-unused-vars': [
            1,
            {
                vars: 'all',
                args: 'none',
            },
        ],
        'no-loop-func': 2,
        'no-unused-expressions': [
            'error',
            {
                allowShortCircuit: true,
                allowTernary: true,
            },
        ],
        semi: 2,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-mixed-spaces-and-tabs': 2,
        'sort-imports': [
            'warn',
            {
                ignoreCase: false,
                ignoreDeclarationSort: false,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ['all', 'single', 'multiple', 'none'],
                allowSeparatedGroups: true,
            },
        ],
    },
};
