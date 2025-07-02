import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createAnnouncements,
  fetchSingleAnnouncement,
  fetchAnnouncementsV2,
  editAnnouncement,
  deleteAnnouncement,
  getAnnouncementMinistryId,
  getAnnouncementByComment,
} from "@/services/AnnouncementsService";

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
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
        in: vi.fn(),
      })),
    })),
  },
}));

// Mock paginate utility
vi.mock("@/lib/utils", () => ({
  paginate: vi.fn(),
}));

describe("AnnouncementsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAnnouncements", () => {
    it("should create announcement with files successfully", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockData = {
        title: "Test Announcement",
        content: "Test content",
        files: [mockFile],
      };
      const userId = "user123";
      const groupId = "group123";

      // Get the mock before setting up the mock implementations
      const { supabase } = await import("@/services/supabaseClient");

      // Mock storage upload
      supabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: "announcement/test-123456789.pdf" },
          error: null,
        }),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      });

      // Mock announcement insert
      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "announcement123" },
              error: null,
            }),
          }),
        }),
        select: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      });

      const result = await createAnnouncements({
        data: mockData,
        userId,
        groupId,
      });

      expect(result).toEqual({ id: "announcement123" });
      expect(supabase.storage.from).toHaveBeenCalledWith("Uroboros");
      expect(supabase.from).toHaveBeenCalledWith("announcement");
      expect(supabase.from).toHaveBeenCalledWith("announcement_files");
    });

    it("should throw error when file upload fails", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockData = {
        title: "Test Announcement",
        content: "Test content",
        files: [mockFile],
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.storage.from().upload.mockResolvedValue({
        data: null,
        error: { message: "Upload failed" },
      });

      await expect(
        createAnnouncements({
          data: mockData,
          userId: "user123",
        })
      ).rejects.toThrow("Error uploading file: Upload failed");
    });
  });

  describe("fetchSingleAnnouncement", () => {
    it("should fetch single announcement successfully", async () => {
      const announcementId = "announcement123";
      const mockAnnouncement = {
        id: "announcement123",
        title: "Test",
        content: "Content",
        users: { first_name: "John", last_name: "Doe", role: "admin" },
        announcement_files: [
          {
            id: "file1",
            url: "path/to/file.pdf",
            name: "file.pdf",
            type: "application/pdf",
          },
        ],
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAnnouncement,
              error: null,
            }),
          }),
        }),
      });

      supabase.storage.from.mockReturnValue({
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/file.pdf" },
        }),
        upload: vi.fn(),
        remove: vi.fn(),
      });

      const result = await fetchSingleAnnouncement(announcementId);

      expect(result.id).toBe("announcement123");
      expect(result.announcement_files[0].url).toBe(
        "https://example.com/file.pdf"
      );
    });

    it("should return null when announcement not found", async () => {
      const { supabase } = await import("@/services/supabaseClient");
      supabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { code: "PGRST116" },
        });

      const result = await fetchSingleAnnouncement("nonexistent");
      expect(result).toBeNull();
    });

    it("should throw error when announcementId is missing", async () => {
      await expect(fetchSingleAnnouncement()).rejects.toThrow(
        "Announcement ID is required to fetch a single announcement."
      );
    });
  });

  describe("fetchAnnouncementsV2", () => {
    it("should fetch announcements with pagination", async () => {
      const mockPaginatedData = {
        items: [
          {
            id: "announcement1",
            title: "Test",
            announcement_files: [
              {
                url: "path/to/file.pdf",
                name: "file.pdf",
                type: "application/pdf",
              },
            ],
          },
        ],
        pageSize: 10,
        currentPage: 1,
        totalItems: 1,
        totalPages: 1,
      };

      const { paginate } = await import("@/lib/utils");
      const { supabase } = await import("@/services/supabaseClient");

      paginate.mockResolvedValue(mockPaginatedData);
      supabase.storage.from().getPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.com/file.pdf" },
      });

      const result = await fetchAnnouncementsV2(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].announcement_files[0].url).toBe(
        "https://example.com/file.pdf"
      );
    });

    it("should filter by subgroupId when provided", async () => {
      const { paginate } = await import("@/lib/utils");
      paginate.mockResolvedValue({ items: [] });

      await fetchAnnouncementsV2(1, 10, null, "subgroup123");

      expect(paginate).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { subgroup_id: "subgroup123" },
        })
      );
    });
  });

  describe("editAnnouncement", () => {
    it("should edit announcement successfully", async () => {
      const mockData = {
        title: "Updated Title",
        content: "Updated Content",
        files: [
          new File(["content"], "new-file.pdf", { type: "application/pdf" }),
        ],
      };
      const announcementId = "announcement123";

      const { supabase } = await import("@/services/supabaseClient");

      // Mock different supabase.from() calls
      supabase.from.mockImplementation((table) => {
        if (table === "announcement_files") {
          return {
            select: vi.fn().mockImplementation((fields) => {
              if (fields === "id,name,url") {
                // First call: get existing files
                return {
                  eq: vi.fn().mockResolvedValue({
                    data: [], // No existing files
                    error: null,
                  }),
                };
              } else if (fields === "id") {
                // Second call: check file existence with chained eq
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: null,
                        error: { code: "PGRST116" }, // File doesn't exist
                      }),
                    }),
                  }),
                };
              }
            }),
            insert: vi.fn().mockResolvedValue({
              error: null,
            }),
            delete: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          };
        } else if (table === "announcement") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
            select: vi.fn(),
            insert: vi.fn(),
            delete: vi.fn(),
          };
        }

        // Default mock for other tables
        return {
          select: vi.fn(),
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        };
      });

      // Mock storage operations
      supabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: "announcement/new-file.pdf" },
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({
          error: null,
        }),
        getPublicUrl: vi.fn(),
      });

      await expect(
        editAnnouncement({
          data: mockData,
          announcementId,
        })
      ).resolves.not.toThrow();
    });

    it("should delete old files not in new data", async () => {
      const mockData = {
        title: "Updated Title",
        content: "Updated Content",
        files: [],
      };
      const announcementId = "announcement123";

      const { supabase } = await import("@/services/supabaseClient");

      // Create separate mock functions for different calls
      const mockSelectEq = vi.fn();
      const mockUpdateEq = vi.fn();
      const mockDeleteIn = vi.fn();

      // Mock the initial file selection query to return existing files
      mockSelectEq.mockResolvedValueOnce({
        data: [
          {
            id: "file1",
            name: "old-file.pdf",
            url: "path/to/old-file.pdf",
          },
        ],
        error: null,
      });

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockSelectEq,
        }),
        update: vi.fn().mockReturnValue({
          eq: mockUpdateEq.mockResolvedValue({
            error: null,
          }),
        }),
        delete: vi.fn().mockReturnValue({
          in: mockDeleteIn.mockResolvedValue({
            error: null,
          }),
        }),
        insert: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      // Mock storage operations
      supabase.storage.from.mockReturnValue({
        remove: vi.fn().mockResolvedValue({
          error: null,
        }),
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      });

      await expect(
        editAnnouncement({
          data: mockData,
          announcementId,
        })
      ).resolves.not.toThrow();

      expect(supabase.storage.from().remove).toHaveBeenCalledWith([
        "path/to/old-file.pdf",
      ]);
    });
  });

  describe("deleteAnnouncement", () => {
    it("should delete announcement and files successfully", async () => {
      const announcementId = "announcement123";
      const filePaths = [
        "https://example.com/storage/v1/object/public/Uroboros/announcement/file.pdf",
      ];

      const { supabase } = await import("@/services/supabaseClient");

      // Mock announcement existence check
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: announcementId },
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      // Mock storage remove
      supabase.storage.from().remove.mockResolvedValue({
        error: null,
      });

      // Mock announcement deletion
      supabase.from().delete().eq.mockResolvedValue({
        error: null,
      });

      await expect(
        deleteAnnouncement({
          announcement_id: announcementId,
          filePaths,
        })
      ).resolves.not.toThrow();

      expect(supabase.storage.from().remove).toHaveBeenCalledWith([
        "announcement/file.pdf",
      ]);
    });

    it("should throw error when announcement ID is missing", async () => {
      await expect(
        deleteAnnouncement({
          filePaths: [],
        })
      ).rejects.toThrow("Announcement ID is missing");
    });
  });

  describe("getAnnouncementMinistryId", () => {
    it("should return ministry IDs for announcement", async () => {
      const announcementId = "announcement123";
      const mockData = [
        { ministry_id: "ministry1" },
        { ministry_id: "ministry2" },
      ];

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from().select().eq.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getAnnouncementMinistryId(announcementId);

      expect(result).toEqual(["ministry1", "ministry2"]);
    });

    it("should throw error when database query fails", async () => {
      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      await expect(
        getAnnouncementMinistryId("announcement123")
      ).rejects.toThrow("Database error");
    });
  });

  describe("getAnnouncementByComment", () => {
    it("should fetch announcement by comment ID", async () => {
      const commentId = "comment123";
      const mockData = {
        announcement: {
          id: "announcement123",
          title: "Test",
          content: "Content",
          created_at: "2023-01-01",
          visibility: "public",
          users: { first_name: "John", last_name: "Doe", role: "admin" },
          announcement_files: [
            {
              id: "file1",
              url: "path/to/file.pdf",
              name: "file.pdf",
              type: "application/pdf",
            },
          ],
        },
      };

      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      supabase.storage.from().getPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.com/file.pdf" },
      });

      const result = await getAnnouncementByComment(commentId);

      expect(result.announcement.id).toBe("announcement123");
      expect(result.announcement.announcement_files[0].url).toBe(
        "https://example.com/file.pdf"
      );
    });

    it("should throw error when query fails", async () => {
      const { supabase } = await import("@/services/supabaseClient");
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Query failed" },
            }),
          }),
        }),
      });

      await expect(getAnnouncementByComment("comment123")).rejects.toThrow(
        "Query failed"
      );
    });
  });
});
