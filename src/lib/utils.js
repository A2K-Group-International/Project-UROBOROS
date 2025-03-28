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
  query = {},
  filters = {},
  order = [],
  inquery = {},
  select = "*",
}) => {
  try {
    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Initialize the query for paginated items
    let supabaseQuery = supabase
      .from(key)
      .select(select)
      .range(from, to)
      .match(query);

    // Apply ordering dynamically
    if (order.length > 0) {
      order.forEach(({ column, ascending }) => {
        supabaseQuery = supabaseQuery.order(column, { ascending });
      });
    }
    if (inquery) {
      if (Object.keys(inquery).length > 0) {
        for (const [column, values] of Object.entries(inquery)) {
          if (Array.isArray(values)) {
            // Ensure values is an array before applying .in()
            supabaseQuery = supabaseQuery.in(column, values);
          } else {
            console.error(
              `Expected an array for column ${column}, but got:`,
              values
            );
          }
        }
      }
    }

    // Apply the is_confirmed filter if provided
    if (filters.active && filters.active !== "all") {
      const isConfirmed = filters.active === "active";
      supabaseQuery = supabaseQuery.eq("is_confirmed", isConfirmed);
    }

    // Apply date filters (this is where the date filter is handled)
    // if (filters.date) {
    //   // Assuming filters.date is in the 'YYYY-MM' format
    //   const [year, month] = filters.date.split("-");

    //   // Get the first day of the month
    //   const startOfMonth = `${year}-${month}-01`;

    //   // Get the last day of the month
    //   const lastDayOfMonth = new Date(year, month, 0).getDate(); // `month` is 0-indexed
    //   const endOfMonth = `${year}-${month}-${lastDayOfMonth}`;

    //   // Apply filtering based on the year and month
    //   supabaseQuery = supabaseQuery
    //     .gte("event_date", startOfMonth) // Filter events from the start of the month
    //     .lte("event_date", endOfMonth); // Filter events until the last day of the month
    // }

    // Apply gte and lte filters if provided
    if (filters.gte) {
      for (const [column, value] of Object.entries(filters.gte)) {
        supabaseQuery = supabaseQuery.gte(column, value);
      }
    }

    if (filters.lte) {
      for (const [column, value] of Object.entries(filters.lte)) {
        supabaseQuery = supabaseQuery.lte(column, value);
      }
    }
    // Apply distinct filters if provided

    // Apply ilike filters if provided
    if (filters.ilike) {
      for (const [column, value] of Object.entries(filters.ilike)) {
        supabaseQuery = supabaseQuery.ilike(column, `%${value}%`);
      }
    }

    // Apply eq filters dynamically for both the items and the count
    if (filters.eq) {
      const { column, value } = filters.eq;
      supabaseQuery = supabaseQuery.eq(column, value);
    }

    // Apply 'id' filters (this is where your fix is integrated)
    if (filters.id) {
      supabaseQuery = supabaseQuery.in("id", filters.id);
    }
    if (filters.in) {
      const { column, value } = filters.in;
      supabaseQuery = supabaseQuery.in(column, value);
    }
    if (filters.not) {
      const { column, filter, value } = filters.not;
      supabaseQuery = supabaseQuery.not(column, filter, value);
    }
    if (filters.or) {
      const orFilters = filters.or
        .map(({ column, filter, value }) => `${column}.${filter}.${value}`)
        .join(",");
      supabaseQuery = supabaseQuery.or(orFilters);
    }

    // Fetch the total count of items, applying eq filters here as well
    let countQuery = supabase
      .from(key)
      .select("*", { count: "exact", head: true });

    // Apply eq filters to the count query
    if (filters.eq) {
      const { column, value } = filters.eq;
      countQuery = countQuery.eq(column, value);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // Fetch the paginated items
    const { data: items, error: itemsError } = await supabaseQuery;

    if (itemsError) throw itemsError;

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / pageSize);

    // Determine if there is a next page
    const nextPage = page < totalPages;

    return {
      items, // data
      currentPage: page, // page
      nextPage, // true or false
      totalPages,
      pageSize,
      totalItems: count,
    };
  } catch (error) {
    console.error("Error paginating items:", error.message);
    throw error;
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
