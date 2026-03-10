jest.mock("#postgres/knex.js", () => ({
    default: jest.fn(),
}));
jest.mock("#config/env/env.js", () => ({
    default: {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@test.iam.gserviceaccount.com",
        GOOGLE_PRIVATE_KEY: "fake-key",
    },
}));

import { SHEET_NAME } from "#services/sheets.js";

describe("sheets", () => {
    describe("SHEET_NAME", () => {
        it("equals stocks_coefs as per TZ", () => {
            expect(SHEET_NAME).toBe("stocks_coefs");
        });
    });
});
