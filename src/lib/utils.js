import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/services/supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

/**
 * Paginate items from a Supabase table.
 * @param {string} key - The table name.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of items per page.
 * @param {object} [query] - Additional query parameters.
 * @returns {Promise<object>} The paginated items and pagination properties.
 * @throws {Error} If an error occurs while fetching the items.
 */
const paginate = async ({
  key,
  page = 1,
  pageSize = 2,
  query = {}, // For .match()
  filters = {}, // For .eq, .gte, .lte, .ilike, .in, .not, .or
  order = [],
  select = "*",
}) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Helper function to apply all filters
    const applyAllFiltersToQueryBuilder = (queryBuilderInstance) => {
      let currentQuery = queryBuilderInstance;

      // Apply .match() filter
      if (Object.keys(query).length > 0) {
        currentQuery = currentQuery.match(query);
      }

      // Apply gte and lte filters
      if (filters.gte) {
        for (const [column, value] of Object.entries(filters.gte)) {
          currentQuery = currentQuery.gte(column, value);
        }
      }
      if (filters.lte) {
        for (const [column, value] of Object.entries(filters.lte)) {
          currentQuery = currentQuery.lte(column, value);
        }
      }
      // Apply ilike filters
      if (filters.ilike) {
        for (const [column, value] of Object.entries(filters.ilike)) {
          currentQuery = currentQuery.ilike(column, `%${value}%`);
        }
      }
      if (filters.is) {
        for (const [column, value] of Object.entries(filters.is)) {
          currentQuery = currentQuery.is(column, value);
        }
      }
      // Apply eq filters
      if (filters.eq) {
        if (Array.isArray(filters.eq)) {
          filters.eq.forEach(({ column, value }) => {
            currentQuery = currentQuery.eq(column, value);
          });
        } else {
          const { column, value } = filters.eq;
          currentQuery = currentQuery.eq(column, value);
        }
      }
      // Apply 'id' as a specific 'in' filter (if filters.id is an array)
      if (filters.id && Array.isArray(filters.id)) {
        currentQuery = currentQuery.in("id", filters.id);
      }
      // Apply general 'in' filters
      if (filters.in) {
        // Expects { column: 'colName', value: ['val1', 'val2'] }
        const { column, value } = filters.in;
        if (Array.isArray(value)) {
          currentQuery = currentQuery.in(column, value);
        }
      }
      // Apply 'not' filters
      if (filters.not) {
        // Expects { column, operator, value } e.g. { column: 'status', operator: 'eq', value: 'archived' }
        const { column, operator, value } = filters.not;
        currentQuery = currentQuery.not(column, operator, value);
      }
      // Apply 'or' filters
      if (filters.or && Array.isArray(filters.or) && filters.or.length > 0) {
        const orFiltersString = filters.or
          .map((orFilter) => {
            // Ensure orFilter has column, operator, value
            if (
              orFilter.column &&
              orFilter.operator &&
              typeof orFilter.value !== "undefined"
            ) {
              return `${orFilter.column}.${orFilter.operator}.${orFilter.value}`;
            }
            console.warn("Invalid 'or' filter object:", orFilter);
            return null;
          })
          .filter(Boolean) // Remove any nulls from invalid filter objects
          .join(",");
        if (orFiltersString) {
          currentQuery = currentQuery.or(orFiltersString);
        }
      }

      // Apply is_confirmed filter (specific logic from original code)
      // Consider making this a standard eq filter passed from the service
      if (filters.active && filters.active !== "all") {
        const isConfirmed = filters.active === "active";
        currentQuery = currentQuery.eq("is_confirmed", isConfirmed);
      }

      return currentQuery;
    };

    // Initialize query for paginated items
    let supabaseQuery = supabase.from(key).select(select);
    supabaseQuery = applyAllFiltersToQueryBuilder(supabaseQuery);

    // Apply ordering (only for data query)
    if (order.length > 0) {
      order.forEach(({ column, ascending }) => {
        supabaseQuery = supabaseQuery.order(column, { ascending });
      });
    }
    // Apply range (only for data query)
    supabaseQuery = supabaseQuery.range(from, to);

    // Initialize query for total count - use same select for count to ensure filters work
    let countQuery = supabase
      .from(key)
      .select(select, { count: "exact", head: true });
    countQuery = applyAllFiltersToQueryBuilder(countQuery);

    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("Supabase count query error:", {
        message: countError.message,
        details: countError.details,
        key,
        query,
        filters,
      });
      throw countError;
    }

    const { data: items, error: itemsError } = await supabaseQuery;
    if (itemsError) {
      console.error("Supabase items query error:", {
        message: itemsError.message,
        details: itemsError.details,
        key,
        query,
        filters,
        select,
        order,
        from,
        to,
      });
      throw itemsError;
    }

    const totalPages = Math.ceil(count / pageSize);
    const nextPage = page < totalPages;

    return {
      items,
      currentPage: page,
      nextPage,
      totalPages,
      pageSize,
      totalItems: count,
    };
  } catch (error) {
    console.error("Error in paginate function:", {
      message: error.message,
      key,
      page,
      pageSize,
      query,
      filters,
    });
    throw error; // Re-throw the error to be caught by the caller
  }
};

/**
 * Gets first initial of a name.
 * @returns {string} The initial of a name.
 */
const getInitial = (name) => {
  return name
    ?.split(" ")
    .map((word) => word[0])[0]
    .toUpperCase();
};

const downloadExcel = (event, eventvolunteers, attendance, attendanceCount) => {
  // Get the list of volunteers and replacement volunteers
  const volunteerList = eventvolunteers
    ? eventvolunteers.map((volunteer) => {
        if (!volunteer?.replaced) {
          return `${volunteer?.users?.first_name?.toFirstUpperCase()} ${volunteer?.users?.last_name?.toFirstUpperCase()}`;
        }
        return `${volunteer?.volunteer_replacement?.first_name?.toFirstUpperCase()} ${volunteer?.volunteer_replacement?.last_name?.toFirstUpperCase()}`;
      })
    : [];

  const headings = [
    ["Event Name", event?.event_name || "Unknown Event"],
    ["Event Date", event?.event_date || "Unknown Date"],
    ["Event Category", event?.event_category || "Unknown Category"],
    ["Total Attended", attendanceCount?.attended || "Unknown"],
    ["Assigned Volunteers", volunteerList.join(", ") || "No Volunteers"],
    [],
  ];

  // Combine data of parents and children, keeping only those who attended
  const combinedData =
    attendance?.data
      ?.filter(
        (family) =>
          family.parents.some((parent) => parent.time_attended) ||
          family.children.some((child) => child.time_attended)
      )
      .flatMap((family) => {
        // Filter parents and children who attended
        const attendedParents = family.parents.filter(
          (parent) => parent.time_attended
        );
        const attendedChildren = family.children.filter(
          (child) => child.time_attended
        );

        return [
          [
            family?.family_surname ? `Family Surname:  ` : "Registered by: ",
            family?.family_surname ??
              `${family.registered_by.first_name} ${family.registered_by.last_name}`,
          ],
          ...(attendedParents.length > 0
            ? [
                ["Parents", "Name", "Contact", "Time In"],
                ...attendedParents.map((parent) => [
                  "",
                  `${parent?.first_name} ${parent?.last_name}`,
                  `${parent?.contact_number}`,
                  new Date(parent.time_attended).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                ]),
              ]
            : []),
          ...(attendedChildren.length > 0
            ? [
                ["Children", "Name", "Contact", "Time In"],
                ...attendedChildren.map((child) => [
                  "",
                  `${child?.first_name} ${child?.last_name}`,
                  `${child?.contact_number ?? "N/A"}`,
                  new Date(child.time_attended).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                ]),
              ]
            : []),
          [],
        ];
      }) || [];

  // Combine the heading and the attendance
  const formattedData = [...headings, [], ...combinedData];

  // Converts data to worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(formattedData);

  // Creates a new workbook and appends the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Writes workbook to file
  XLSX.writeFile(workbook, `${event?.event_name}.xlsx`);
};

const exportAttendanceList = (
  event,
  eventvolunteers,
  attendance,
  attendanceCount
) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.text(`Event Name: ${event.event_name}`, 10, 10);

  // Format Event Date
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Event Date: ${formattedDate}`, 10, 20);

  // Add Total Attended
  doc.text(`Total Attended: ${attendanceCount.attended}`, 150, 10);

  let currentY = 30; // Start Y position for the next section

  // Add List of Assigned Volunteers
  if (eventvolunteers && eventvolunteers.length > 0) {
    doc.setFontSize(14);
    doc.text("List of Assigned Volunteer(s):", 10, currentY);
    currentY += 10;

    eventvolunteers.forEach((volunteer, index) => {
      doc.setFontSize(12);
      doc.text(
        `${index + 1}. ${volunteer.users.first_name.charAt(0).toUpperCase() + volunteer.users.first_name.slice(1)} ${volunteer.users.last_name.charAt(0).toUpperCase() + volunteer.users.last_name.slice(1)}`,
        10,
        currentY
      );
      currentY += 7; // Spacing for each volunteer
    });

    currentY += 5; // Additional spacing after the volunteer list
  }

  // Loop through the family data
  attendance?.data.forEach((family) => {
    // Filter out the parents who attended
    const attendedParents = family.parents.filter((parent) => parent.attended);

    // Filter out the children who attended
    const attendedChildren = family.children.filter((child) => child.attended);

    // Skip families with no attendees
    if (attendedParents.length === 0 && attendedChildren.length === 0) {
      return;
    }

    // Add Family Surname Header
    doc.setFontSize(14);
    doc.text(
      family?.family_surname
        ? `Family Surname ${family?.family_surname}`
        : `Registered by ${family.registered_by.first_name} ${family.registered_by.last_name}`,
      10,
      currentY
    );

    // Update currentY for the next element
    currentY += 10;

    // Add Parents Table for those who attended
    if (attendedParents.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Parents/Guardians", "Contact", "Status"]],
        body: attendedParents.map((parent) => [
          `${parent.first_name} ${parent.last_name}`,
          parent.contact_number || "N/A",
          "Attended",
        ]),
        theme: "striped",
      });

      // Update currentY after parents table
      currentY = doc.lastAutoTable.finalY + 5;
    }

    // Add Children Table for those who attended
    if (attendedChildren.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Child's Name", "Status"]],
        body: attendedChildren.map((child) => [
          `${child.first_name} ${child.last_name}`,
          "Attended",
        ]),
        theme: "grid",
      });

      // Update currentY after children table
      currentY = doc.lastAutoTable.finalY + 5;
    }
  });

  // Save the PDF
  doc.save(`${event.event_name}-${formattedDate}.pdf`);
};

const formatEventDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatEventTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

//Function to convert a time string (HH:MM:ss) to a date object
const convertTimeStringToDate = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":");
  const eventTime = new Date();
  eventTime.setHours(parseInt(hours, 10));
  eventTime.setMinutes(parseInt(minutes, 10));
  eventTime.setSeconds(parseInt(seconds, 10));

  return eventTime;
};

/**
 * Formats event time with dots and lowercase (e.g., "10.30am")
 * @param {string} time - The event time string
 * @returns {string} Formatted time string
 */
const formatEventTimeCompact = (time) => {
  try {
    if (!time) return "";

    // Try to handle both cases: when date is provided and when only time is provided
    let dateTime;

    if (time.includes("T")) {
      // Time is already a full datetime string
      dateTime = new Date(time);
    } else {
      // Time is just a time string (HH:MM:SS)
      dateTime = new Date(`2000-01-01T${time}`);
    }

    // Check if date is valid
    if (isNaN(dateTime.getTime())) {
      console.error("Invalid time for compact formatting:", time);
      return "";
    }

    return dateTime
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace(":", ".")
      .replace(" ", "")
      .toLowerCase();
  } catch (error) {
    console.error("Error formatting time compact:", error, time);
    return "";
  }
};

export {
  getCurrentTime,
  cn,
  paginate,
  getInitial,
  downloadExcel,
  exportAttendanceList,
  formatEventDate,
  formatEventTime,
  convertTimeStringToDate,
  formatEventTimeCompact,
};
