import { it, describe, expect, vi, beforeEach } from "vitest";
import {
  getMinistryVolunteers,
  getOneMinistryGroup,
  fetchAllMinistryBasics,
  getAllMinistries,
  getAssignedMinistries,
  getMinistryGroups,
} from "@/services/ministryService";

// Mock SupabaseClient
vi.mock("@/services/supabaseClient", () => {
  const mockEq = vi.fn();
  const mockSelect = vi.fn(() => ({
    eq: mockEq,
  }));

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
  }));

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

// Import after mocking to get the mocked version
import { supabase } from "@/services/supabaseClient";

describe("getOneMinistryGroup", () => {
  // Mock handlers for chain
  const mockEq = vi.fn();
  const mockSelect = vi.fn(() => ({
    eq: mockEq,
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock chain
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("should return group data for a given ministryId", async () => {
    // Mock Supabase response
    const mockData = [{ id: "123", name: "Test Group" }];
    mockEq.mockResolvedValueOnce({ data: mockData, error: null });

    // Call the function
    const result = await getOneMinistryGroup("ministry-123");

    // Expectations
    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith("groups");

    expect(mockSelect).toHaveBeenCalledWith(
      "id, name, description, ministry_id"
    );
    expect(mockEq).toHaveBeenCalledWith("ministry_id", "ministry-123");
  });

  it("should throw an error if Supabase responds with an error", async () => {
    // Mock an error
    mockEq.mockResolvedValueOnce({
      data: null,
      error: { message: "Some Error" },
    });

    // Should throw
    await expect(getOneMinistryGroup("ministry-123")).rejects.toThrow(
      "Some Error"
    );

    // Expectations
    expect(supabase.from).toHaveBeenCalledWith("groups");

    expect(mockSelect).toHaveBeenCalledWith(
      "id, name, description, ministry_id"
    );
    expect(mockEq).toHaveBeenCalledWith("ministry_id", "ministry-123");
  });
});

// -----------------------------------------------------------------------------

describe("getMinistryVolunteers", () => {
  // Mock handlers for chains
  let mockGroupSingle, mockGroupFirstEq, mockGroupSecondEq;
  let mockMembersSelect, mockMembersEq;
  let mockCoordinatorsSelect, mockCoordinatorsEq;

  // Helper to streamline setting up
  const setupMockSupabaseChain = ({
    group,
    members,
    coordinators,
    groupError,
  } = {}) => {
    mockGroupSingle.mockResolvedValueOnce(
      group ? { data: group, error: null } : { data: null, error: groupError }
    );

    mockMembersEq.mockResolvedValueOnce(
      members ? { data: members, error: null } : { data: [], error: null }
    );

    mockCoordinatorsEq.mockResolvedValueOnce(
      coordinators
        ? { data: coordinators, error: null }
        : { data: [], error: null }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock for groups
    mockGroupSingle = vi.fn();
    mockGroupSecondEq = vi.fn().mockReturnValue({ single: mockGroupSingle });
    mockGroupFirstEq = vi.fn().mockReturnValue({ eq: mockGroupSecondEq });
    const mockGroupSelect = vi.fn().mockReturnValue({ eq: mockGroupFirstEq });

    // Mock for group_members
    mockMembersEq = vi.fn();
    mockMembersSelect = vi.fn().mockReturnValue({ eq: mockMembersEq });

    // Mock for ministry_coordinators
    mockCoordinatorsEq = vi.fn();
    mockCoordinatorsSelect = vi
      .fn()
      .mockReturnValue({ eq: mockCoordinatorsEq });

    // Mocking from()
    vi.mocked(supabase.from).mockImplementation((tableName) => {
      if (tableName === "groups") {
        return { select: mockGroupSelect };
      } else if (tableName === "group_members") {
        return { select: mockMembersSelect };
      } else if (tableName === "ministry_coordinators") {
        return { select: mockCoordinatorsSelect };
      }
      return { select: vi.fn() };
    });

    // Store references
    this.mocks = {
      groupSingle: mockGroupSingle,
      groupFirstEq: mockGroupFirstEq,
      groupSecondEq: mockGroupSecondEq,
      membersEq: mockMembersEq,
      coordinatorsEq: mockCoordinatorsEq,
    };
  });

  it("should return combined volunteers and coordinators for a ministry", async () => {
    // Mock group
    setupMockSupabaseChain({
      group: { id: "group-123", name: "Volunteers" },
      members: [
        { users: { id: "v1", first_name: "John", last_name: "Doe" } },
        { users: { id: "v2", first_name: "Jane", last_name: "Smith" } },
      ],
      coordinators: [
        { users: { id: "c1", first_name: "Mike", last_name: "Johnson" } },
      ],
    });

    // Call the function
    const result = await getMinistryVolunteers("ministry-123");

    // Combine
    expect(result).toEqual([
      { users: { id: "v1", first_name: "John", last_name: "Doe" } },
      { users: { id: "v2", first_name: "Jane", last_name: "Smith" } },
      { users: { id: "c1", first_name: "Mike", last_name: "Johnson" } },
    ]);
  });

  it("should return empty array when no volunteers group exists", async () => {
    // Mock group not found
    setupMockSupabaseChain({
      groupError: { code: "PGRST116", message: "Not found" },
    });

    // Call
    const result = await getMinistryVolunteers("ministry-123");

    // Should be empty
    expect(result).toEqual([]);
  });

  it("should throw an error for group query error", async () => {
    // Mock group with error
    setupMockSupabaseChain({
      groupError: {
        code: "OTHER_ERROR",
        message: "Database connection failed",
      },
    });

    // Should throw
    await expect(getMinistryVolunteers("ministry-123")).rejects.toThrow(
      "Database connection failed"
    );
  });

  it("should throw an error if group members query fails", async () => {
    // Setup successful group query
    const groupData = {
      id: "group-123",
      name: "Volunteers",
      ministry_id: "ministry-123",
    };
    this.mocks.groupSingle.mockResolvedValueOnce({
      data: groupData,
      error: null,
    });

    // Setup error for members query
    const errorMessage = "Failed to retrieve members";
    this.mocks.membersEq.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    // The function should reject with the expected error
    await expect(getMinistryVolunteers("ministry-123")).rejects.toThrow(
      errorMessage
    );
  });

  it("should throw an error if coordinators query fails", async () => {
    // Setup successful group query
    const groupData = {
      id: "group-123",
      name: "Volunteers",
      ministry_id: "ministry-123",
    };
    this.mocks.groupSingle.mockResolvedValueOnce({
      data: groupData,
      error: null,
    });

    // Setup successful members query
    this.mocks.membersEq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Setup error for coordinators query
    const errorMessage = "Failed to retrieve coordinators";
    this.mocks.coordinatorsEq.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    // The function should reject with the expected error
    await expect(getMinistryVolunteers("ministry-123")).rejects.toThrow(
      errorMessage
    );
  });

  it("should return empty array when there are no members or coordinators", async () => {
    // Mock group
    setupMockSupabaseChain({
      group: { id: "group-123", name: "Volunteers" },
      members: [],
      coordinators: [],
    });

    // Call
    const result = await getMinistryVolunteers("ministry-123");

    // Should be empty
    expect(result).toEqual([]);
  });
});

// -----------------------------------------------------------------------------

describe("fetchAllMinistryBasics", () => {
  it("should return data when fetch is successful", async () => {
    // Mock a successful response
    const mockSelect = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: "One Ministry" }],
      error: null,
    });

    supabase.from.mockReturnValue({ select: mockSelect });

    const result = await fetchAllMinistryBasics();

    expect(result).toEqual([{ id: 1, name: "One Ministry" }]);

    expect(supabase.from).toHaveBeenCalledWith("ministries");

    expect(mockSelect).toHaveBeenCalledWith("*");
  });

  it("should throw an error when fetch fails", async () => {
    // Mock a failed response
    const mockSelect = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Some Error" } });

    supabase.from.mockReturnValue({ select: mockSelect });

    await expect(fetchAllMinistryBasics()).rejects.toThrow("Some Error");

    expect(supabase.from).toHaveBeenCalledWith("ministries");

    expect(mockSelect).toHaveBeenCalledWith("*");
  });
});

// -----------------------------------------------------------------------------

describe("getAllMinistries", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock storage first
    const mockGetPublicUrl = vi
      .fn()
      .mockReturnValue({ data: { publicUrl: "http://example.com/image.jpg" } });
    const mockStorageFrom = vi
      .fn()
      .mockReturnValue({ getPublicUrl: mockGetPublicUrl });

    supabase.storage = {
      from: mockStorageFrom,
    };
  });

  it("should return data with updated image URLs", async () => {
    // Mock chain for from().select().order()
    const mockOrder = vi.fn().mockResolvedValue({
      data: [
        { id: 1, image_url: "foo.jpg", name: "Ministry One" },
        { id: 2, image_url: "bar.jpg", name: "Ministry Two" },
      ],
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    supabase.from.mockReturnValue({ select: mockSelect });

    // Perform service call
    const result = await getAllMinistries();

    // Expectations
    expect(supabase.from).toHaveBeenCalledWith("ministries");

    expect(mockSelect).toHaveBeenCalledWith("*, ministry_coordinators(id)");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });

    // Storage should be called to get URLs
    expect(supabase.storage.from).toHaveBeenCalledWith("Uroboros");

    expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledTimes(2);
    expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledWith(
      "foo.jpg"
    );

    expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledWith(
      "bar.jpg"
    );

    // The URLs should be updated
    expect(result[0].image_url).toEqual("http://example.com/image.jpg");

    expect(result[1].image_url).toEqual("http://example.com/image.jpg");
  });

  it("should throw an error when fetch fails", async () => {
    // Mock chain to produce error
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Some Error" } });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

    supabase.from.mockReturnValue({ select: mockSelect });

    await expect(getAllMinistries()).rejects.toThrow("Some Error");

    expect(supabase.from).toHaveBeenCalledWith("ministries");

    expect(mockSelect).toHaveBeenCalledWith("*, ministry_coordinators(id)");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

// -----------------------------------------------------------------------------

describe("getAssignedMinistries", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock storage first
    const mockGetPublicUrl = vi
      .fn()
      .mockReturnValue({ data: { publicUrl: "http://example.com/image.jpg" } });
    const mockStorageFrom = vi
      .fn()
      .mockReturnValue({ getPublicUrl: mockGetPublicUrl });

    supabase.storage = {
      from: mockStorageFrom,
    };
  });

  it("should return assigned ministries with updated image URLs", async () => {
    // Mock response from Supabase
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { ministries: { id: 1, image_url: "foo.jpg", name: "Ministry 1" } },
        { ministries: { id: 2, image_url: "bar.jpg", name: "Ministry 2" } },
      ],
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    supabase.from.mockReturnValue({ select: mockSelect });

    // Call service
    const result = await getAssignedMinistries(123);

    // Expectations
    expect(supabase.from).toHaveBeenCalledWith("ministry_coordinators");

    expect(mockSelect).toHaveBeenCalledWith("ministries(*)");

    expect(mockEq).toHaveBeenCalledWith("coordinator_id", 123);

    // Storage should be called for each image
    expect(supabase.storage.from).toHaveBeenCalledWith("Uroboros");

    expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledTimes(2);

    // Image URLs should be updated
    expect(result[0].image_url).toEqual("http://example.com/image.jpg");

    expect(result[1].image_url).toEqual("http://example.com/image.jpg");
  });

  it("should throw an error when fetch fails", async () => {
    // Mock response with error
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Some Error" } });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    supabase.from.mockReturnValue({ select: mockSelect });

    await expect(getAssignedMinistries(123)).rejects.toThrow("Some Error");

    expect(supabase.from).toHaveBeenCalledWith("ministry_coordinators");

    expect(mockSelect).toHaveBeenCalledWith("ministries(*)");

    expect(mockEq).toHaveBeenCalledWith("coordinator_id", 123);
  });
});

// -----------------------------------------------------------------------------

describe("getMinistryGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock storage
    const mockGetPublicUrl = vi
      .fn()
      .mockReturnValue({ data: { publicUrl: "http://example.com/image.jpg" } });
    const mockStorageFrom = vi
      .fn()
      .mockReturnValue({ getPublicUrl: mockGetPublicUrl });

    supabase.storage = { from: mockStorageFrom };
  });

  it("should return grouped ministries with updated image URLs", async () => {
    // Mock response from Supabase
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          joined_at: "2024-06-16T12:00:00Z",
          groups: {
            id: 1,
            name: "Group 1",
            description: "Description 1",
            ministry_id: 1,
            image_url: "group.jpg",
            ministry: {
              id: 1,
              ministry_name: "Ministry 1",
              image_url: "ministry.jpg",
            },
          },
          users: { id: 123 },
        },
      ],
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    supabase.from.mockReturnValue({ select: mockSelect });

    // Call service
    const result = await getMinistryGroups(123);

    // Check that we called Supabase with proper parameters
    expect(supabase.from).toHaveBeenCalledWith("group_members");

    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("id"));
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("groups(id, name, description")
    );
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("users(id)")
    );

    expect(mockEq).toHaveBeenCalledWith("user_id", 123);

    // Storage should be called for both ministry and group
    expect(supabase.storage.from).toHaveBeenCalledWith("Uroboros");

    expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledTimes(2);

    // Image URLs should be updated
    expect(result[0].image_url).toEqual("http://example.com/image.jpg");

    expect(result[0].groups[0].image_url).toEqual(
      "http://example.com/image.jpg"
    );

    // The group structure should be correct
    expect(result[0].groups.length).toEqual(1);
    expect(result[0].groups[0].group_name).toEqual("Group 1");

    // The ministry structure should be correct
    expect(result[0].ministry_name).toEqual("Ministry 1");
  });

  it("should throw an error when fetch fails", async () => {
    // Mock response with error
    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Some Error" },
    });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    supabase.from.mockReturnValue({ select: mockSelect });

    await expect(getMinistryGroups(123)).rejects.toThrow("Some Error");

    expect(supabase.from).toHaveBeenCalledWith("group_members");

    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("id"));
  });
});
