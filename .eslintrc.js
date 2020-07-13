module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true,
        node: true
    },
    extends: [
        'airbnb-base',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:react/recommended'
    ],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2017,
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: [
        'import'
    ],
    rules: {
        //
        // general linting rules
        //
        'arrow-parens': [2, 'as-needed'],
        'comma-dangle': ['error', 'only-multiline'],
        'import/no-commonjs': 2,
        indent: ['error', 4, { ignoredNodes: ['JSXElement', 'JSXElement *'] }],
        'linebreak-style': 0,
        'max-len': ['error', { code: 180 }],
        'no-restricted-syntax': [
            'error',
            {
                selector: 'LabeledStatement',
                message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
            },
            {
                selector: 'WithStatement',
                message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize'
            }
        ],
        'no-unused-expressions': ['error', { allowTernary: true }],
        'object-curly-spacing': ['error', 'always'],
        'object-shorthand': 0,
        'prefer-destructuring': [
            'error',
            { array: false, object: false },
            { enforceForRenamedProperties: false }
        ],
        'template-curly-spacing': ['error', 'always'],

        //
        // eslint-plugin-react
        //
        // React specific linting rules for ESLint
        //
        'class-methods-use-this': ['error', { exceptMethods: ['render'] }], // Prevent static render methods from required the use of `this`
        'jsx-quotes': ['error', 'prefer-single'], // Enforce quote style for JSX attributes
        'react/display-name': 0, // Prevent missing displayName in a React component definition
        'react/jsx-closing-bracket-location': 2, // Enforce the closing bracket location for JSX multiline elements
        'react/jsx-curly-spacing': [
            2,
            {
                when: 'always',
                children: true,
                spacing: {
                    objectLiterals: 'never'
                }
            }
        ],
        'react/jsx-indent': [2, 4],
        'react/jsx-no-undef': 2, // Disallow undeclared variables in JSX
        'react/jsx-sort-default-props': 2, // Enforce default props alphabetical sorting
        'react/jsx-sort-props': [2, { ignoreCase: true }], // Enforce props alphabetical sorting
        'react/jsx-uses-react': 2, // Prevent React to be incorrectly marked as unused
        'react/jsx-uses-vars': 2, // Prevent variables used in JSX to be incorrectly marked as unused
        'react/jsx-wrap-multilines': 2, // Prevent missing parentheses around multilines JSX
        'react/prop-types': 2, // Prevent missing props validation in a React component definition
        // Note: using an asynchronous setState in componentDidMount is now the officially suggested way to handle
        // things which used to go inside componentWillMount, which has been deprecated.
        // 'react/no-did-mount-set-state': 2,
        'react/no-multi-comp': 0, // Prevent multiple component definition per file
        'react/no-unknown-property': 2, // Prevent usage of unknown DOM property
        'react/react-in-jsx-scope': 2, // Prevent missing React when using JSX
        'react/self-closing-comp': 2, // Prevent extra closing tags for components without children
        'react/sort-prop-types': 2, // Enforce propTypes alphabetical sorting
    },
    settings: {
        'import/resolver': {
            node: {
                paths: ['src'] // This allows absolute imports for project components. E.g.: import Thing from 'components/Thing'
            }
        },
        react: {
            version: 'latest'
        }
    }
};
