module.exports = {
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        }
    }
};
