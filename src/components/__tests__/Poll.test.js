import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  deletePoll,
  addPoll,
  fetchPolls,
  fetchPollsByUser,
  fetchPoll,
  answerSinglePoll,
  fetchPollAnswers,
  fetchPollDates,
  fetchPollUserAnswers,
  addTimeSlot,
} from "@/services/pollServices";

vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));
vi.mock("@/services/ministryService", () => ({
  getMinistriesMembers: vi.fn(),
}));
vi.mock("@/services/groupServices", () => ({
  fetchGroupsMembers: vi.fn(),
}));

const createSupabaseMockChain = () => ({
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
});

describe("addPoll", () => {
  let supabaseMock;
  let getMinistriesMembersMock;
  let fetchGroupsMembersMock;
  let pollData;

  beforeEach(async () => {
    vi.clearAllMocks();

    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;

    const ministryService = await import("@/services/ministryService");
    getMinistriesMembersMock = ministryService.getMinistriesMembers;

    const groupServices = await import("@/services/groupServices");
    fetchGroupsMembersMock = groupServices.fetchGroupsMembers;

    pollData = {
      pollName: "Test Poll",
      pollDescription: "Test Description",
      shareMode: "public",
      creator_id: "user-123",
      timeSlots: [{ time: "10:00", dateIndex: 0 }],
      pollDates: [new Date("2025-07-01T00:00:00.000Z")],
      pollDateExpiry: new Date("2025-07-10T00:00:00.000Z"),
      pollTimeExpiry: "17:00",
      ministryIds: [],
      userIds: [],
      groupIds: [],
    };
  });

  const calculateExpectedExpirationDate = (dateExpiry, timeExpiry) => {
    const dateObj = new Date(dateExpiry);
    const datePart = dateObj.toISOString().split("T")[0];
    return new Date(`${datePart}T${timeExpiry}:00`).toISOString();
  };

  it("should create a public poll successfully", async () => {
    const mockPollChain = createSupabaseMockChain();
    const mockPollDatesChain = createSupabaseMockChain();
    const mockPollTimesChain = createSupabaseMockChain();

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return mockPollChain;
      if (table === "poll_dates") return mockPollDatesChain;
      if (table === "poll_times") return mockPollTimesChain;
      return createSupabaseMockChain();
    });

    mockPollChain.insert.mockReturnThis();
    mockPollChain.select.mockReturnThis();
    mockPollChain.single.mockResolvedValueOnce({
      data: { id: "poll-xyz" },
      error: null,
    });

    mockPollDatesChain.insert.mockReturnThis();
    mockPollDatesChain.select.mockReturnThis();
    mockPollDatesChain.single.mockResolvedValueOnce({
      data: { id: "date-1-id" },
      error: null,
    });

    mockPollTimesChain.insert.mockResolvedValue({ error: null });

    const result = await addPoll(pollData);

    const expectedExpiration = calculateExpectedExpirationDate(
      pollData.pollDateExpiry,
      pollData.pollTimeExpiry
    );

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(mockPollChain.insert).toHaveBeenCalledWith({
      name: pollData.pollName,
      description: pollData.pollDescription,
      visibility: pollData.shareMode,
      creator_id: pollData.creator_id,
      expiration_date: expectedExpiration,
    });
    expect(mockPollChain.select).toHaveBeenCalledWith("id");
    expect(mockPollChain.single).toHaveBeenCalledTimes(1);
    expect(mockPollDatesChain.single).toHaveBeenCalledTimes(
      pollData.pollDates.length
    );
    expect(result).toEqual({ message: "Poll created successfully" });
  });

  it("should create a poll and add members for ministry", async () => {
    const ministryPollData = {
      ...pollData,
      shareMode: "ministry",
      ministryIds: [{ value: "min-1" }, { value: "min-2" }],
    };
    const mockPollChain = createSupabaseMockChain();
    const mockPollDatesChain = createSupabaseMockChain();
    const mockPollTimesChain = createSupabaseMockChain();
    const mockUserPollsChain = createSupabaseMockChain();

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return mockPollChain;
      if (table === "poll_dates") return mockPollDatesChain;
      if (table === "poll_times") return mockPollTimesChain;
      if (table === "user_polls") return mockUserPollsChain;
      return createSupabaseMockChain();
    });

    mockPollChain.insert.mockReturnThis();
    mockPollChain.select.mockReturnThis();
    mockPollChain.single.mockResolvedValueOnce({
      data: { id: "poll-min" },
      error: null,
    });

    mockPollDatesChain.insert.mockReturnThis();
    mockPollDatesChain.select.mockReturnThis();
    mockPollDatesChain.single.mockResolvedValueOnce({
      data: { id: "date-1-id" },
      error: null,
    });
    mockPollTimesChain.insert.mockResolvedValue({ error: null });
    mockUserPollsChain.insert.mockResolvedValue({ error: null });

    getMinistriesMembersMock.mockResolvedValueOnce(["user-a", "user-b"]);

    await addPoll(ministryPollData);

    expect(getMinistriesMembersMock).toHaveBeenCalledWith(["min-1", "min-2"]);
    expect(supabaseMock.from).toHaveBeenCalledWith("user_polls");
    expect(mockUserPollsChain.insert).toHaveBeenCalledWith([
      { user_id: "user-a", poll_id: "poll-min" },
      { user_id: "user-b", poll_id: "poll-min" },
    ]);
  });

  it("should create a poll and add members for specific users", async () => {
    const specificPollData = {
      ...pollData,
      shareMode: "specific",
      userIds: [{ value: "user-c" }, { value: "user-d" }],
    };
    const mockPollChain = createSupabaseMockChain();
    const mockPollDatesChain = createSupabaseMockChain();
    const mockPollTimesChain = createSupabaseMockChain();
    const mockUserPollsChain = createSupabaseMockChain();

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return mockPollChain;
      if (table === "poll_dates") return mockPollDatesChain;
      if (table === "poll_times") return mockPollTimesChain;
      if (table === "user_polls") return mockUserPollsChain;
      return createSupabaseMockChain();
    });

    mockPollChain.insert.mockReturnThis();
    mockPollChain.select.mockReturnThis();
    mockPollChain.single.mockResolvedValueOnce({
      data: { id: "poll-spec" },
      error: null,
    });

    mockPollDatesChain.insert.mockReturnThis();
    mockPollDatesChain.select.mockReturnThis();
    mockPollDatesChain.single.mockResolvedValueOnce({
      data: { id: "date-1-id" },
      error: null,
    });
    mockPollTimesChain.insert.mockResolvedValue({ error: null });
    mockUserPollsChain.insert.mockResolvedValue({ error: null });

    await addPoll(specificPollData);

    expect(supabaseMock.from).toHaveBeenCalledWith("user_polls");
    expect(mockUserPollsChain.insert).toHaveBeenCalledWith([
      { user_id: "user-c", poll_id: "poll-spec" },
      { user_id: "user-d", poll_id: "poll-spec" },
    ]);
  });

  it("should create a poll and add members for group", async () => {
    const groupPollData = {
      ...pollData,
      shareMode: "group",
      groupIds: [{ value: "group-1" }],
    };
    const mockPollChain = createSupabaseMockChain();
    const mockPollDatesChain = createSupabaseMockChain();
    const mockPollTimesChain = createSupabaseMockChain();
    const mockUserPollsChain = createSupabaseMockChain();

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return mockPollChain;
      if (table === "poll_dates") return mockPollDatesChain;
      if (table === "poll_times") return mockPollTimesChain;
      if (table === "user_polls") return mockUserPollsChain;
      return createSupabaseMockChain();
    });

    mockPollChain.insert.mockReturnThis();
    mockPollChain.select.mockReturnThis();
    mockPollChain.single.mockResolvedValueOnce({
      data: { id: "poll-group" },
      error: null,
    });

    mockPollDatesChain.insert.mockReturnThis();
    mockPollDatesChain.select.mockReturnThis();
    mockPollDatesChain.single.mockResolvedValueOnce({
      data: { id: "date-1-id" },
      error: null,
    });
    mockPollTimesChain.insert.mockResolvedValue({ error: null });
    mockUserPollsChain.insert.mockResolvedValue({ error: null });

    fetchGroupsMembersMock.mockResolvedValueOnce(["user-e", "user-f"]);

    await addPoll(groupPollData);

    expect(fetchGroupsMembersMock).toHaveBeenCalledWith(["group-1"]);
    expect(supabaseMock.from).toHaveBeenCalledWith("user_polls");
    expect(mockUserPollsChain.insert).toHaveBeenCalledWith([
      { user_id: "user-e", poll_id: "poll-group" },
      { user_id: "user-f", poll_id: "poll-group" },
    ]);
  });

  it("should throw an error if poll creation fails", async () => {
    const mockPollChain = createSupabaseMockChain();
    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return mockPollChain;
      return createSupabaseMockChain();
    });
    mockPollChain.insert.mockReturnThis();
    mockPollChain.select.mockReturnThis();
    mockPollChain.single.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });

    await expect(addPoll(pollData)).rejects.toEqual(
      "Error creating poll: DB error"
    );
  });

  it("should throw an error for invalid expiration date format", async () => {
    const invalidDatePollData = {
      ...pollData,
      pollDateExpiry: "invalid-date-string",
    };

    await expect(addPoll(invalidDatePollData)).rejects.toThrow(
      "Invalid time value"
    );
  });
});

describe("deletePoll", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should delete a poll successfully", async () => {
    const pollId = "poll-123";

    // Mock the check existence chain
    const checkChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: pollId },
        error: null,
      }),
    };

    // Mock the delete chain
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    // Set up from mock to return different chains based on call order
    let callCount = 0;
    supabaseMock.from.mockImplementation((tableName) => {
      if (tableName === "polls") {
        callCount++;
        return callCount === 1 ? checkChain : deleteChain;
      }
      return checkChain;
    });

    const result = await deletePoll(pollId);

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(supabaseMock.from).toHaveBeenCalledTimes(2);
    expect(checkChain.select).toHaveBeenCalledWith("id");
    expect(checkChain.eq).toHaveBeenCalledWith("id", pollId);
    expect(checkChain.maybeSingle).toHaveBeenCalled();
    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith("id", pollId);
    expect(result).toEqual({ message: "Poll deleted successfully" });
  });

  it("should throw an error if checking poll existence fails", async () => {
    const pollId = "poll-123";

    const checkChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database connection error" },
      }),
    };

    supabaseMock.from.mockReturnValue(checkChain);

    await expect(deletePoll(pollId)).rejects.toThrow(
      "Database connection error"
    );

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if poll does not exist", async () => {
    const pollId = "non-existent-poll";

    const checkChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    supabaseMock.from.mockReturnValue(checkChain);

    await expect(deletePoll(pollId)).rejects.toThrow("Poll does not exist");

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(supabaseMock.from).toHaveBeenCalledTimes(1); // Should not reach delete
  });

  it("should throw an error if delete operation fails", async () => {
    const pollId = "poll-123";

    // Mock the check existence chain (successful)
    const checkChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: pollId },
        error: null,
      }),
    };

    // Mock the delete chain (fails)
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: { message: "Failed to delete poll" },
      }),
    };

    let callCount = 0;
    supabaseMock.from.mockImplementation((tableName) => {
      if (tableName === "polls") {
        callCount++;
        return callCount === 1 ? checkChain : deleteChain;
      }
      return checkChain;
    });

    await expect(deletePoll(pollId)).rejects.toEqual("Failed to delete poll");

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(supabaseMock.from).toHaveBeenCalledTimes(2);
    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith("id", pollId);
  });

  it("should handle empty poll_id parameter", async () => {
    const pollId = "";

    const checkChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    supabaseMock.from.mockReturnValue(checkChain);

    await expect(deletePoll(pollId)).rejects.toThrow("Poll does not exist");

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(checkChain.eq).toHaveBeenCalledWith("id", "");
  });

  it("should handle null poll_id parameter", async () => {
    const pollId = null;

    const checkChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    supabaseMock.from.mockReturnValue(checkChain);

    await expect(deletePoll(pollId)).rejects.toThrow("Poll does not exist");

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(checkChain.eq).toHaveBeenCalledWith("id", null);
  });
});

describe("fetchPolls", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should fetch public and private polls successfully", async () => {
    const userId = "user-123";
    const publicPolls = [
      { id: "poll-1", name: "Public Poll", visibility: "public" },
    ];
    const privatePolls = [
      { polls: { id: "poll-2", name: "Private Poll", visibility: "private" } },
    ];

    const publicPollsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: publicPolls, error: null }),
    };

    const privatePollsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: privatePolls, error: null }),
    };

    const pollAnswerCountChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ count: 5, error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return publicPollsChain;
      if (table === "user_polls") return privatePollsChain;
      if (table === "poll_answers") return pollAnswerCountChain;
      return createSupabaseMockChain();
    });

    const result = await fetchPolls({ user_id: userId });

    expect(supabaseMock.from).toHaveBeenCalledWith("polls");
    expect(supabaseMock.from).toHaveBeenCalledWith("user_polls");
    expect(supabaseMock.from).toHaveBeenCalledWith("poll_answers");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ ...publicPolls[0], answer_count: 5 });
    expect(result[1]).toEqual({ ...privatePolls[0].polls, answer_count: 5 });
  });

  it("should handle fetch error for public polls", async () => {
    const userId = "user-123";

    const publicPollsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Fetch error" } }),
    };

    supabaseMock.from.mockReturnValue(publicPollsChain);

    await expect(fetchPolls({ user_id: userId })).rejects.toThrow(
      "Fetch error"
    );
  });
});

describe("fetchPollsByUser", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should fetch polls created by user successfully", async () => {
    const userId = "user-123";
    const userPolls = [{ id: "poll-1", name: "User Poll", creator_id: userId }];

    const userPollsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: userPolls, error: null }),
    };

    const pollAnswerCountChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { user_id: "user-1" },
          { user_id: "user-2" },
          { user_id: "user-3" },
        ],
        error: null,
      }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return userPollsChain;
      if (table === "poll_answers") return pollAnswerCountChain;
      return createSupabaseMockChain();
    });

    const result = await fetchPollsByUser({ user_id: userId });

    expect(userPollsChain.eq).toHaveBeenCalledWith("creator_id", userId);
    expect(result).toEqual([{ ...userPolls[0], answer_count: 3 }]);
  });
});

describe("fetchPoll", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should fetch poll with dates, times, and answers successfully", async () => {
    const pollId = "poll-123";
    const userId = "user-123";
    const pollData = {
      id: pollId,
      name: "Test Poll",
      poll_dates: [{ id: "date-1", poll_times: [{ id: "time-1" }] }],
    };
    const pollAnswers = [{ id: "answer-1", answer: "available" }];

    const pollChain = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: pollData, error: null }),
    };

    const answersChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    // Mock fetchPollAnswers call
    answersChain.eq
      .mockReturnValueOnce(answersChain) // First .eq() call returns the chain
      .mockResolvedValueOnce({ data: pollAnswers, error: null }); // Second .eq() call resolves with data

    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return pollChain;
      if (table === "poll_answers") return answersChain;
      return createSupabaseMockChain();
    });

    const result = await fetchPoll({ poll_id: pollId, user_id: userId });

    expect(pollChain.eq).toHaveBeenCalledWith("id", pollId);
    expect(result.poll_answers).toEqual({
      available: pollAnswers,
      availableCount: 1,
      availablePercent: 100,
      ifneeded: [],
      ifneededCount: 0,
      ifneededPercent: 0,
      unavailable: [],
      unavailableCount: 0,
      unavailablePercent: 0,
      mostAvailable: pollAnswers,
      mostUnavailable: [],
    });
  });

  it("should throw error if poll not found", async () => {
    const pollId = "non-existent";
    const userId = "user-123";

    const pollChain = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Not found" } }),
    };

    supabaseMock.from.mockReturnValue(pollChain);

    await expect(
      fetchPoll({ poll_id: pollId, user_id: userId })
    ).rejects.toThrow("Not found");
  });
});

describe("answerSinglePoll", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should answer poll successfully", async () => {
    const answerData = {
      poll_id: "poll-123",
      user_id: "user-123",
      poll_date_id: "date-1",
      poll_time_id: "time-1",
      answer: "available",
    };

    const pollExistChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: { id: "poll-123" }, error: null }),
    };

    const userPollExistChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    const upsertChain = {
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    let callCount = 0;
    supabaseMock.from.mockImplementation((table) => {
      if (table === "polls") return pollExistChain;
      if (table === "user_polls") return userPollExistChain;
      if (table === "poll_answers") {
        callCount++;
        return callCount === 1 ? upsertChain : createSupabaseMockChain();
      }
      return createSupabaseMockChain();
    });

    userPollExistChain.eq.mockReturnThis();

    await answerSinglePoll(answerData);

    expect(pollExistChain.eq).toHaveBeenCalledWith("id", answerData.poll_id);
    expect(upsertChain.upsert).toHaveBeenCalledWith({
      poll_date_id: answerData.poll_date_id,
      poll_time_id: answerData.poll_time_id,
      answer: answerData.answer,
      user_id: answerData.user_id,
      poll_id: answerData.poll_id,
    });
  });

  it("should throw error if poll does not exist", async () => {
    const answerData = {
      poll_id: "non-existent",
      user_id: "user-123",
      poll_date_id: "date-1",
      poll_time_id: "time-1",
      answer: "available",
    };

    const pollExistChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    supabaseMock.from.mockReturnValue(pollExistChain);

    await expect(answerSinglePoll(answerData)).rejects.toThrow(
      "Poll does not exist"
    );
  });
});

describe("fetchPollAnswers", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should fetch poll answers successfully", async () => {
    // const pollId = "poll-123";
    // const userId = "user-123";
    const answers = [{ id: "answer-1", answer: "available" }];

    const answersChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    answersChain.eq
      .mockReturnValueOnce(answersChain) // First .eq() call returns the chain
      .mockResolvedValueOnce({ data: answers, error: null }); // Second .eq() call resolves with data

    supabaseMock.from.mockReturnValue(answersChain);

    const result = await fetchPollAnswers({
      poll_date_id: "date-1",
      poll_time_id: "time-1",
    });

    expect(answersChain.eq).toHaveBeenCalledWith("poll_date_id", "date-1");
    expect(answersChain.eq).toHaveBeenCalledWith("poll_time_id", "time-1");
    expect(result).toEqual({
      available: answers,
      availableCount: 1,
      availablePercent: 100,
      ifneeded: [],
      ifneededCount: 0,
      ifneededPercent: 0,
      unavailable: [],
      unavailableCount: 0,
      unavailablePercent: 0,
      mostAvailable: answers,
      mostUnavailable: [],
    });
  });
});

describe("fetchPollDates", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should fetch poll dates successfully", async () => {
    const pollId = "poll-123";
    const pollDates = [{ id: "date-1", date: "2025-07-01", poll_times: [] }];

    const datesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: pollDates, error: null }),
    };

    supabaseMock.from.mockReturnValue(datesChain);

    const result = await fetchPollDates({ poll_id: pollId });

    expect(datesChain.eq).toHaveBeenCalledWith("poll_id", pollId);
    expect(result).toEqual(pollDates);
  });

  it("should throw error if no poll dates found", async () => {
    const pollId = "poll-123";

    const datesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    supabaseMock.from.mockReturnValue(datesChain);

    await expect(fetchPollDates({ poll_id: pollId })).rejects.toThrow(
      "No poll dates found for this poll"
    );
  });
});

describe("fetchPollUserAnswers", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should fetch and process poll user answers successfully", async () => {
    const pollDateId = "date-1";
    const pollTimeId = "time-1";
    const pollUserAnswers = {
      answer: "available",
      users: { first_name: "John", last_name: "Doe" },
    };

    const answersChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: pollUserAnswers, error: null }),
    };

    answersChain.eq
      .mockReturnValueOnce(answersChain)
      .mockReturnValueOnce(answersChain);

    supabaseMock.from.mockReturnValue(answersChain);

    const result = await fetchPollUserAnswers({
      poll_date_id: pollDateId,
      poll_time_id: pollTimeId,
      user_id: "user-123",
    });

    expect(answersChain.eq).toHaveBeenCalledWith("poll_time_id", pollTimeId);
    expect(answersChain.eq).toHaveBeenCalledWith("user_id", "user-123");
    expect(result).toEqual({
      answer: "available",
      users: { first_name: "John", last_name: "Doe" },
    });
  });
});

describe("addTimeSlot", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should add time slot successfully", async () => {
    const timeSlotData = {
      poll_date_id: "date-1",
      time: "10:00",
    };

    const timeSlotChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    supabaseMock.from.mockReturnValue(timeSlotChain);

    const result = await addTimeSlot(timeSlotData);

    expect(supabaseMock.from).toHaveBeenCalledWith("poll_times");
    expect(timeSlotChain.insert).toHaveBeenCalledWith({
      poll_date_id: timeSlotData.poll_date_id,
      time: timeSlotData.time,
    });
    expect(result).toEqual({ message: "Time slot added successfully" });
  });

  it("should throw error if adding time slot fails", async () => {
    const timeSlotData = {
      poll_date_id: "date-1",
      time: "10:00",
    };

    const timeSlotChain = {
      insert: vi
        .fn()
        .mockResolvedValue({ error: { message: "Insert failed" } }),
    };

    supabaseMock.from.mockReturnValue(timeSlotChain);

    await expect(addTimeSlot(timeSlotData)).rejects.toEqual(
      "Error adding time slot: Insert failed"
    );
  });
});
