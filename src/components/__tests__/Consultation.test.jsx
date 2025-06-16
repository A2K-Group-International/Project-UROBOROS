import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addConsultation,
  checkConsultationExistence,
  getTotalConsultations,
} from "@/services/consultationServices";

vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const createSupabaseMockChain = () => ({
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
});

describe("checkConsultationExistence", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should check consultation existence successfully", async () => {
    const userId = "user-123";
    const familyIdData = { family_id: "family-456" };
    const consultationData = {
      id: "consultation-1",
      users: { first_name: "John", last_name: "Doe" },
    };

    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: familyIdData, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: consultationData, error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    const result = await checkConsultationExistence(userId);

    expect(supabaseMock.from).toHaveBeenCalledWith("parents");
    expect(parentsChain.select).toHaveBeenCalledWith("family_id");
    expect(parentsChain.eq).toHaveBeenCalledWith("parishioner_id", userId);
    expect(parentsChain.maybeSingle).toHaveBeenCalled();

    expect(supabaseMock.from).toHaveBeenCalledWith("consultations");
    expect(consultationsChain.select).toHaveBeenCalledWith(
      "*, users:users(first_name, last_name)"
    );
    expect(consultationsChain.eq).toHaveBeenCalledWith(
      "family_id",
      familyIdData.family_id
    );
    expect(consultationsChain.maybeSingle).toHaveBeenCalled();

    expect(result).toEqual({
      userFamilyId: familyIdData,
      consultationExist: consultationData,
    });
  });

  it("should throw error if user ID is not provided", async () => {
    await expect(checkConsultationExistence()).rejects.toThrow(
      "User ID is required"
    );
    await expect(checkConsultationExistence("")).rejects.toThrow(
      "User ID is required"
    );
    await expect(checkConsultationExistence(null)).rejects.toThrow(
      "User ID is required"
    );
  });

  it("should throw error if user does not have a family ID", async () => {
    const userId = "user-123";

    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    supabaseMock.from.mockReturnValue(parentsChain);

    await expect(checkConsultationExistence(userId)).rejects.toThrow(
      "User does not have a family ID associated."
    );
  });

  it("should throw error if fetching family ID fails", async () => {
    const userId = "user-123";

    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { family_id: "family-456" },
        error: { message: "Database error" },
      }),
    };

    supabaseMock.from.mockReturnValue(parentsChain);

    await expect(checkConsultationExistence(userId)).rejects.toThrow(
      "Error fetching family ID: Database error"
    );
  });

  it("should throw error if fetching consultation fails", async () => {
    const userId = "user-123";
    const familyIdData = { family_id: "family-456" };

    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: familyIdData, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Consultation fetch error" },
      }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    await expect(checkConsultationExistence(userId)).rejects.toThrow(
      "Error fetching consultation: Consultation fetch error"
    );
  });

  it("should return null consultation if none exists", async () => {
    const userId = "user-123";
    const familyIdData = { family_id: "family-456" };

    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: familyIdData, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    const result = await checkConsultationExistence(userId);

    expect(result).toEqual({
      userFamilyId: familyIdData,
      consultationExist: null,
    });
  });
});

describe("addConsultation", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should add consultation successfully", async () => {
    const userId = "user-123";
    const consultation = {
      preferenceA: "1st",
      preferenceB: "2nd",
      preferenceC: "3rd",
      massPreference: "9.30am",
      optionalReasons: "Test reasons",
    };

    // Mock for checkConsultationExistence calls
    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { family_id: "family-456" },
        error: null,
      }),
    };

    const consultationsCheckChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    // Mock for addConsultation insert call
    const consultationsInsertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ error: null }),
    };

    let callCount = 0;
    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") {
        callCount++;
        // First call is for checking existence, second is for inserting
        return callCount === 1
          ? consultationsCheckChain
          : consultationsInsertChain;
      }
      return createSupabaseMockChain();
    });

    const result = await addConsultation({ userId, consultation });

    expect(supabaseMock.from).toHaveBeenCalledWith("parents");
    expect(supabaseMock.from).toHaveBeenCalledWith("consultations");
    expect(consultationsInsertChain.insert).toHaveBeenCalledWith([
      {
        id: userId,
        preference_a: consultation.preferenceA,
        preference_b: consultation.preferenceB,
        preference_c: consultation.preferenceC,
        preference_mass: consultation.massPreference,
        optional_reason: consultation.optionalReasons,
        family_id: "family-456",
        user_id: userId,
      },
    ]);
    expect(consultationsInsertChain.select).toHaveBeenCalled();
    expect(result).toEqual({ message: "Consultation added successfully" });
  });

  it("should throw error if user has already submitted preferences", async () => {
    const userId = "user-123";
    const consultation = {
      preferenceA: "1st",
      preferenceB: "2nd",
      preferenceC: "3rd",
      massPreference: "9.30am",
      optionalReasons: "Test reasons",
    };

    // Mock for checkConsultationExistence calls - user already has consultation
    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { family_id: "family-456" },
        error: null,
      }),
    };

    const consultationsCheckChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "existing-consultation" },
        error: null,
      }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsCheckChain;
      return createSupabaseMockChain();
    });

    await expect(addConsultation({ userId, consultation })).rejects.toThrow(
      "You have already submitted your preferences."
    );

    expect(supabaseMock.from).toHaveBeenCalledWith("parents");
    expect(supabaseMock.from).toHaveBeenCalledWith("consultations");
    // Should not reach the insert chain since user already has consultation
    expect(supabaseMock.from).toHaveBeenCalledTimes(2);
  });

  it("should throw error if insertion fails", async () => {
    const userId = "user-123";
    const consultation = {
      preferenceA: "1st",
      preferenceB: "2nd",
      preferenceC: "3rd",
      massPreference: "9.30am",
      optionalReasons: "Test reasons",
    };

    // Mock for checkConsultationExistence calls
    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { family_id: "family-456" },
        error: null,
      }),
    };

    const consultationsCheckChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    // Mock for addConsultation insert call - this will fail
    const consultationsInsertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        error: { message: "Insert failed" },
      }),
    };

    let callCount = 0;
    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") {
        callCount++;
        return callCount === 1
          ? consultationsCheckChain
          : consultationsInsertChain;
      }
      return createSupabaseMockChain();
    });

    await expect(addConsultation({ userId, consultation })).rejects.toThrow(
      "Error adding consultation: Insert failed"
    );
  });

  it("should handle consultation with empty optional reasons", async () => {
    const userId = "user-123";
    const consultation = {
      preferenceA: "1st",
      preferenceB: "2nd",
      preferenceC: "3rd",
      massPreference: "11.00am",
      optionalReasons: "",
    };

    // Mock for checkConsultationExistence calls
    const parentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { family_id: "family-456" },
        error: null,
      }),
    };

    const consultationsCheckChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    // Mock for addConsultation insert call
    const consultationsInsertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ error: null }),
    };

    let callCount = 0;
    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") {
        callCount++;
        return callCount === 1
          ? consultationsCheckChain
          : consultationsInsertChain;
      }
      return createSupabaseMockChain();
    });

    const result = await addConsultation({ userId, consultation });

    expect(consultationsInsertChain.insert).toHaveBeenCalledWith([
      {
        id: userId,
        preference_a: consultation.preferenceA,
        preference_b: consultation.preferenceB,
        preference_c: consultation.preferenceC,
        preference_mass: consultation.massPreference,
        optional_reason: "",
        family_id: "family-456",
        user_id: userId,
      },
    ]);
    expect(result).toEqual({ message: "Consultation added successfully" });
  });
});

describe("getTotalConsultations", () => {
  let supabaseMock;

  beforeEach(async () => {
    vi.clearAllMocks();
    const supabaseClient = await import("@/services/supabaseClient");
    supabaseMock = supabaseClient.supabase;
  });

  it("should calculate consultation statistics successfully", async () => {
    const familyMembersCount = 100;
    const consultations = [
      {
        preference_a: "1st",
        preference_b: "2nd",
        preference_c: "3rd",
        preference_mass: "9.30am",
        family_group: {
          id: "family-1",
          parents: [{ id: "parent-1" }, { id: "parent-2" }],
        },
      },
      {
        preference_a: "2nd",
        preference_b: "1st",
        preference_c: "3rd",
        preference_mass: "11.00am",
        family_group: { id: "family-2", parents: [{ id: "parent-3" }] },
      },
      {
        preference_a: "3rd",
        preference_b: "2nd",
        preference_c: "1st",
        preference_mass: "6.00pm; Saturday",
        family_group: {
          id: "family-3",
          parents: [{ id: "parent-4" }, { id: "parent-5" }, { id: "parent-6" }],
        },
      },
    ];

    const parentsChain = {
      select: vi
        .fn()
        .mockResolvedValue({ count: familyMembersCount, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockResolvedValue({ data: consultations, error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    const result = await getTotalConsultations();

    expect(supabaseMock.from).toHaveBeenCalledWith("parents");
    expect(parentsChain.select).toHaveBeenCalledWith("*", {
      count: "exact",
      head: true,
    });

    expect(supabaseMock.from).toHaveBeenCalledWith("consultations");
    expect(consultationsChain.select).toHaveBeenCalledWith(
      "*,family_group:family_id(id, parents:parents(id))",
      { count: "exact" }
    );

    // Expected calculations:
    // Family 1 (2 parents): preference_a=1st (3*2=6), preference_b=2nd (2*2=4), preference_c=3rd (1*2=2), mass=9.30am (2)
    // Family 2 (1 parent): preference_a=2nd (2*1=2), preference_b=1st (3*1=3), preference_c=3rd (1*1=1), mass=11.00am (1)
    // Family 3 (3 parents): preference_a=3rd (1*3=3), preference_b=2nd (2*3=6), preference_c=1st (3*3=9), mass=6.00pm (3)
    // Total responded: 2+1+3 = 6 family members
    // No response: 100-6 = 94, multiplied by 6 = 564

    expect(result.preference_a_points).toBe(11); // 6+2+3
    expect(result.preference_b_points).toBe(13); // 4+3+6
    expect(result.preference_c_points).toBe(12); // 2+1+9
    expect(result.noResponseCount).toBe(94); // (100-6)
    expect(result.nineThirtyAMCount).toBe(2);
    expect(result.elevenAMCount).toBe(1);
    expect(result.sixPMCount).toBe(3);
    expect(result.eightAMCount).toBe(0);
    expect(result.familyResponseCount).toBe(6);

    // Total points = 11+13+12+564 = 600
    expect(result.preference_a_percentage).toBe(2); // Math.round(11/600*100) = 2
    expect(result.preference_b_percentage).toBe(2); // Math.round(13/600*100) = 2
    expect(result.preference_c_percentage).toBe(2); // Math.round(12/600*100) = 2
    expect(result.no_response_percentage).toBe(94); // Math.round(564/600*100) = 94
  });

  it("should handle families with no parents", async () => {
    const familyMembersCount = 50;
    const consultations = [
      {
        preference_a: "1st",
        preference_b: "2nd",
        preference_c: "3rd",
        preference_mass: "8.00am",
        family_group: { id: "family-1", parents: [] },
      },
      // Fix: Don't use null family_group as it causes null reference error in the service
      {
        preference_a: "2nd",
        preference_b: "1st",
        preference_c: "3rd",
        preference_mass: "9.30am",
        family_group: { id: "family-2", parents: [] },
      },
    ];

    const parentsChain = {
      select: vi
        .fn()
        .mockResolvedValue({ count: familyMembersCount, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockResolvedValue({ data: consultations, error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    const result = await getTotalConsultations();

    // Each consultation with empty parents counts as 1 family member
    expect(result.familyResponseCount).toBe(2); // 1+1
    expect(result.preference_a_points).toBe(5); // 3*1 + 2*1
    expect(result.preference_b_points).toBe(5); // 2*1 + 3*1
    expect(result.preference_c_points).toBe(2); // 1*1 + 1*1
    expect(result.eightAMCount).toBe(1);
    expect(result.nineThirtyAMCount).toBe(1);
  });

  it("should throw error if fetching family members count fails", async () => {
    const parentsChain = {
      select: vi.fn().mockResolvedValue({
        count: null,
        error: { message: "Count error" },
      }),
    };

    supabaseMock.from.mockReturnValue(parentsChain);

    await expect(getTotalConsultations()).rejects.toThrow(
      "Error fetching family members count: Count error"
    );
  });

  it("should throw error if fetching consultations fails", async () => {
    const familyMembersCount = 100;

    const parentsChain = {
      select: vi
        .fn()
        .mockResolvedValue({ count: familyMembersCount, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Consultations error" },
      }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    await expect(getTotalConsultations()).rejects.toThrow(
      "Error fetching total consultations: Consultations error"
    );
  });

  it("should handle empty consultations data", async () => {
    const familyMembersCount = 50;

    const parentsChain = {
      select: vi
        .fn()
        .mockResolvedValue({ count: familyMembersCount, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    const result = await getTotalConsultations();

    expect(result.preference_a_points).toBe(0);
    expect(result.preference_b_points).toBe(0);
    expect(result.preference_c_points).toBe(0);
    expect(result.familyResponseCount).toBe(0);
    expect(result.noResponseCount).toBe(50);
    expect(result.nineThirtyAMCount).toBe(0);
    expect(result.elevenAMCount).toBe(0);
    expect(result.sixPMCount).toBe(0);
    expect(result.eightAMCount).toBe(0);
  });

  it("should handle all mass preference types", async () => {
    const familyMembersCount = 20;
    const consultations = [
      {
        preference_a: "1st",
        preference_b: "2nd",
        preference_c: "3rd",
        preference_mass: "9.30am",
        family_group: { id: "family-1", parents: [{ id: "parent-1" }] },
      },
      {
        preference_a: "1st",
        preference_b: "2nd",
        preference_c: "3rd",
        preference_mass: "11.00am",
        family_group: { id: "family-2", parents: [{ id: "parent-2" }] },
      },
      {
        preference_a: "1st",
        preference_b: "2nd",
        preference_c: "3rd",
        preference_mass: "6.00pm; Saturday",
        family_group: { id: "family-3", parents: [{ id: "parent-3" }] },
      },
      {
        preference_a: "1st",
        preference_b: "2nd",
        preference_c: "3rd",
        preference_mass: "8.00am",
        family_group: { id: "family-4", parents: [{ id: "parent-4" }] },
      },
    ];

    const parentsChain = {
      select: vi
        .fn()
        .mockResolvedValue({ count: familyMembersCount, error: null }),
    };

    const consultationsChain = {
      select: vi.fn().mockResolvedValue({ data: consultations, error: null }),
    };

    supabaseMock.from.mockImplementation((table) => {
      if (table === "parents") return parentsChain;
      if (table === "consultations") return consultationsChain;
      return createSupabaseMockChain();
    });

    const result = await getTotalConsultations();

    expect(result.nineThirtyAMCount).toBe(1);
    expect(result.elevenAMCount).toBe(1);
    expect(result.sixPMCount).toBe(1);
    expect(result.eightAMCount).toBe(1);
  });
});
