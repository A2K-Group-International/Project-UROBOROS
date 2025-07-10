import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  addComment,
  fetchComments,
  deleteComment,
  updateComment,
  addReply,
  fetchNestedReplies,
  likeComment,
  dislikeComment,
  getCommentStatus,
  getLikeCount,
  getDislikeCount,
  fetchComment,
} from "@/services/commentsService";

// Mock supabase client
vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
        })),
        order: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

vi.mock("@/lib/utils", () => ({
  paginate: vi.fn(),
}));

describe("CommentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("addComment", () => {
    it("should add comment without file successfully", async () => {
      const mockData = {
        comment: "Test comment",
        user_id: "user123",
        announcement_id: "announcement123",
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(addComment(mockData)).resolves.not.toThrow();
    });

    it("should throw error when user_id is missing", async () => {
      const mockData = {
        comment: "Test comment",
        announcement_id: "announcement123",
      };

      await expect(addComment(mockData)).rejects.toThrow(
        "User ID and Post ID are required!"
      );
    });
  });

  describe("fetchComments", () => {
    it("should fetch comments with pagination", async () => {
      const mockPaginatedData = {
        items: [
          {
            id: "comment1",
            comment_content: "Test comment",
            file_url: null,
            users: { id: "user1", first_name: "John", last_name: "Doe" },
          },
        ],
        pageSize: 10,
        currentPage: 1,
        totalItems: 1,
        totalPages: 1,
      };

      const { paginate } = await import("@/lib/utils");
      paginate.mockResolvedValue(mockPaginatedData);

      const result = await fetchComments(1, 10, "announcement123");
      expect(result.items).toHaveLength(1);
    });

    it("should throw error when announcement_id is missing", async () => {
      await expect(fetchComments(1, 10)).rejects.toThrow(
        "announcement_id is required!"
      );
    });
  });

  describe("deleteComment", () => {
    it("should delete comment successfully", async () => {
      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(deleteComment("comment123")).resolves.not.toThrow();
    });

    it("should throw error when comment_id is missing", async () => {
      await expect(deleteComment()).rejects.toThrow("comment_id is required!");
    });
  });

  describe("updateComment", () => {
    it("should throw error when comment_id is missing", async () => {
      await expect(
        updateComment({ comment: "Updated", file: null })
      ).rejects.toThrow("comment_id is required!");
    });
  });

  describe("addReply", () => {
    it("should throw error when user_id is missing", async () => {
      await expect(
        addReply({
          reply: "Test reply",
          comment_id: "comment123",
          announcement_id: "announcement123",
        })
      ).rejects.toThrow("User ID and comment ID are required!");
    });
  });

  describe("fetchNestedReplies", () => {
    it("should throw error when comment_id is missing", async () => {
      await expect(fetchNestedReplies()).rejects.toThrow(
        "CommentID is required!"
      );
    });
  });

  describe("likeComment", () => {
    it("should like comment when not already liked", async () => {
      const mockData = {
        comment_id: "comment123",
        user_id: "user123",
        columnName: "comment_id",
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockImplementation((table) => {
        if (table === "liked_comments") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "disliked_comments") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
          };
        }
        return {
          select: vi.fn(),
          insert: vi.fn(),
          delete: vi.fn(),
        };
      });

      await expect(likeComment(mockData)).resolves.not.toThrow();
    });
  });

  describe("dislikeComment", () => {
    it("should dislike comment when not already disliked", async () => {
      const mockData = {
        comment_id: "comment123",
        user_id: "user123",
        columnName: "comment_id",
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockImplementation((table) => {
        if (table === "liked_comments") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
          };
        }
        if (table === "disliked_comments") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: vi.fn(),
          insert: vi.fn(),
          delete: vi.fn(),
        };
      });

      await expect(dislikeComment(mockData)).resolves.not.toThrow();
    });
  });

  describe("getCommentStatus", () => {
    it("should return comment like/dislike status", async () => {
      const mockData = {
        comment_id: "comment123",
        user_id: "user123",
        columnName: "comment_id",
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockImplementation((table) => {
        if (table === "liked_comments") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ id: "like1" }] }),
              }),
            }),
          };
        }
        if (table === "disliked_comments") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const result = await getCommentStatus(mockData);
      expect(result).toEqual({
        isLiked: true,
        isDisliked: false,
      });
    });
  });

  describe("getLikeCount", () => {
    it("should return like count for comment", async () => {
      const mockData = {
        comment_id: "comment123",
        columnName: "comment_id",
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null, count: 5 }),
        }),
      });

      const result = await getLikeCount(mockData);
      expect(result).toBe(5);
    });

    it("should throw error when comment_id is missing", async () => {
      await expect(getLikeCount({ columnName: "comment_id" })).rejects.toThrow(
        "comment_id and columnName is required!"
      );
    });
  });

  describe("getDislikeCount", () => {
    it("should return dislike count for comment", async () => {
      const mockData = {
        comment_id: "comment123",
        columnName: "comment_id",
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null, count: 2 }),
        }),
      });

      const result = await getDislikeCount(mockData);
      expect(result).toBe(2);
    });
  });

  describe("fetchComment", () => {
    it("should fetch single comment successfully", async () => {
      const mockComment = {
        id: "comment123",
        comment_content: "Test comment",
        users: { first_name: "John", last_name: "Doe" },
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockComment,
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchComment("comment123");
      expect(result).toEqual(mockComment);
    });

    it("should throw error when comment_id is missing", async () => {
      await expect(fetchComment()).rejects.toThrow("comment_id is required!");
    });
  });
});
