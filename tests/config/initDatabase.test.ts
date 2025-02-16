import { initDatabase, pool } from "../../src/config";

jest.mock("../../src/config/pool", () => ({
  pool: {
    connect: jest.fn(),
  },
}));

describe("initDatabase", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialise the database successfully", async () => {
    await initDatabase();

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining(`CREATE TABLE IF NOT EXISTS transactions`),
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining(`CREATE TABLE IF NOT EXISTS amendments`),
    );
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("should throw an error if database initialisation fails", async () => {
    const error = new Error("Database error");
    mockClient.query.mockRejectedValueOnce(error);

    await expect(initDatabase()).rejects.toThrow("Database error");

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });
});
