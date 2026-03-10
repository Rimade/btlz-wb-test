/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/*.test.ts", "**/*.spec.ts"],
    transform: {
        "\\.ts$": "babel-jest",
    },
    moduleNameMapper: {
        "^#(.+)\\.js$": "<rootDir>/src/$1.ts",
    },
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.d.ts"],
    coverageDirectory: "coverage",
};
