import { getMinistriesMembers } from "./ministryService";
import { supabase } from "./supabaseClient";
import { fetchGroupsMembers } from "./groupServices";
import { getAuthToken } from "./emailService";
import axios from "axios";

const addPoll = async ({
  pollName,
  pollDescription,
  shareMode,
  creator_id,
  timeSlots,
  pollDates,
  pollDateExpiry,
  pollTimeExpiry,
  ministryIds,
  userIds,
  groupIds,
}) => {
  // Validate and construct expiration date
  const dateObj = new Date(pollDateExpiry);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const datePart = `${year}-${month}-${day}`;

  const expirationDate = new Date(`${datePart}T${pollTimeExpiry}:00`);

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({
      name: pollName,
      description: pollDescription,
      visibility: shareMode,
      creator_id,
      expiration_date: expirationDate.toISOString(),
    })
    .select("id")
    .single();

  if (error) throw `Error creating poll: ${error.message}`;

  await addPollDates({ times: timeSlots, dates: pollDates, poll_id: poll.id });

  if (shareMode === "ministry") {
    const Ids = ministryIds.map((ministry) => ministry.value);
    const user_ids = await getMinistriesMembers(Ids);

    const ministriesToInsert = Ids.map((ministry_id) => ({
      ministry_id,
      poll_id: poll.id,
    }));

    const { error: addPollMinistry } = await supabase
      .from("poll_ministries")
      .insert(ministriesToInsert);

    if (addPollMinistry) {
      throw new Error(
        `Error adding ministries to poll: ${addPollMinistry.message}`
      );
    }
    await addPollMembers({ user_ids, poll_id: poll.id });
  }

  if (shareMode === "specific") {
    const Ids = userIds.map((user) => user.value);
    await addPollMembers({ user_ids: Ids, poll_id: poll.id });
  }
  if (shareMode === "group") {
    const Ids = groupIds.map((group) => group.value);

    const user_ids = await fetchGroupsMembers(Ids);

    const groupsToInsert = Ids.map((group_id) => ({
      group_id,
      poll_id: poll.id,
    }));
    const { error: addPollGroup } = await supabase
      .from("poll_groups")
      .insert(groupsToInsert);
    if (addPollGroup) {
      console.error(`Error adding groups to poll: ${addPollGroup.message}`);
      throw new Error(`Error adding groups to poll: ${addPollGroup.message}`);
    }
    await addPollMembers({ user_ids, poll_id: poll.id });
  }

  return { message: "Poll created successfully" };
};

const editPolls = async ({
  pollId,
  pollName,
  pollDescription,
  shareMode,
  creator_id,
  timeSlots,
  pollDates,
  pollDateExpiry,
  pollTimeExpiry,
  ministryIds,
  userIds,
  groupIds,
}) => {
  // Validate and construct expiration date
  let dateObj;
  if (pollDateExpiry instanceof Date) {
    dateObj = pollDateExpiry;
  } else {
    dateObj = new Date(pollDateExpiry);
  }
  if (isNaN(dateObj.getTime()) || typeof pollTimeExpiry !== "string") {
    throw new Error("Invalid date or time format for poll expiration");
  }
  const datePart = dateObj.toISOString().split("T")[0];
  const expirationDate = new Date(`${datePart}T${pollTimeExpiry}:00`);
  if (isNaN(expirationDate.getTime())) {
    throw new Error("Invalid date or time format for poll expiration");
  }

  const { data: poll, existError } = await supabase
    .from("polls")
    .select("id")
    .eq("id", pollId)
    .maybeSingle();

  if (existError) {
    throw new Error(existError.message);
  }

  if (!poll) {
    throw new Error("Poll does not exist");
  }

  const { error } = await supabase
    .from("polls")
    .update({
      name: pollName,
      description: pollDescription,
      creator_id,
      visibility: shareMode,
      expiration_date: expirationDate.toISOString(),
    })
    .eq("id", pollId);
  if (error) {
    throw new Error(`Error updating poll: ${error.message}`);
  }

  await editPollDates({ dates: pollDates, poll_id: poll.id, times: timeSlots });

  const { error: deleteError } = await supabase
    .from("user_polls")
    .delete()
    .eq("poll_id", poll.id);

  if (deleteError) {
    throw new Error(
      `Error deleting previous poll members: ${deleteError.message}`
    );
  }

  if (shareMode === "ministry") {
    const { error: deletePollMinistries } = await supabase
      .from("poll_ministries")
      .delete()
      .eq("poll_id", poll.id);
    if (deletePollMinistries) {
      throw new Error(
        `Error deleting previous poll ministries: ${deletePollMinistries.message}`
      );
    }

    const Ids = ministryIds.map((ministry) => ministry.value);

    const ministriesToInsert = Ids.map((ministries_id) => ({
      ministry_id: ministries_id,
      poll_id: poll.id,
    }));

    const { error: addPollMinistries } = await supabase
      .from("poll_ministries")
      .insert(ministriesToInsert);

    if (addPollMinistries) {
      throw new Error(
        `Error adding ministries to poll: ${addPollMinistries.message}`
      );
    }

    const user_ids = await getMinistriesMembers(Ids);

    await addPollMembers({ user_ids, poll_id: poll.id });
  }

  if (shareMode === "specific") {
    const Ids = userIds.map((user) => user.value);
    await addPollMembers({ user_ids: Ids, poll_id: poll.id });
  }
  if (shareMode === "group") {
    const { error: deletePollGroups } = await supabase
      .from("poll_groups")
      .delete()
      .eq("poll_id", poll.id);

    if (deletePollGroups) {
      throw new Error(
        `Error deleting previous poll groups: ${deletePollGroups.message}`
      );
    }

    const Ids = groupIds.map((group) => group.value);
    const user_ids = await fetchGroupsMembers(Ids);

    const groupsToInsert = Ids.map((group_id) => ({
      group_id,
      poll_id: poll.id,
    }));

    const { error: addPollGroupError } = await supabase
      .from("poll_groups")
      .insert(groupsToInsert);

    if (addPollGroupError) {
      throw new Error(
        `Error adding groups to poll: ${addPollGroupError.message}`
      );
    }

    await addPollMembers({ user_ids, poll_id: poll.id });
  }

  return { message: "Poll updated successfully" };
};

const deletePoll = async (poll_id) => {
  const { data: pollExist, error: existError } = await supabase
    .from("polls")
    .select("id")
    .eq("id", poll_id)
    .maybeSingle();
  if (existError) {
    throw new Error(existError.message);
  }
  if (!pollExist) {
    throw new Error("Poll does not exist");
  }

  const { error } = await supabase.from("polls").delete().eq("id", poll_id);

  if (error) throw error.message;

  return { message: "Poll deleted successfully" };
};

const addPollDates = async ({ dates, times, poll_id }) => {
  await Promise.all(
    dates.map(async (date, i) => {
      const isoDate = new Date(date).toISOString();
      const { data: pollDate, error } = await supabase
        .from("poll_dates")
        .insert({
          date: isoDate,
          poll_id,
        })
        .select("id")
        .single();

      const relevantTimes = times.filter((time) => time.dateIndex === i);

      const pollTimesToInsert = relevantTimes.map((time) => ({
        time: time.time,
        poll_date_id: pollDate.id,
      }));
      const { error: timeError } = await supabase
        .from("poll_times")
        .insert(pollTimesToInsert);

      if (timeError) throw timeError.message;

      if (error) throw error.message;
    })
  );
};

const editPollDates = async ({ dates, times, poll_id }) => {
  // 1. Get existing dates and times from DB
  const { data: existingDbDates, error: fetchError } = await supabase
    .from("poll_dates")
    .select("id, date, poll_times(id, time)")
    .eq("poll_id", poll_id);

  if (fetchError) {
    throw new Error(
      `Error fetching existing poll dates: ${fetchError.message}`
    );
  }

  // 2. Normalize incoming dates and times into a schedule for easier comparison.
  const newSchedule = new Map();
  dates.forEach((date, i) => {
    const dateKey = new Date(date).toISOString().split("T")[0];
    const relevantTimes = times
      .filter((time) => time.dateIndex === i)
      .map((t) => t.time);
    newSchedule.set(dateKey, {
      isoDate: new Date(date).toISOString(),
      times: new Set(relevantTimes),
    });
  });

  // 3. Normalize existing DB dates for easier comparison.
  const existingSchedule = new Map();
  existingDbDates.forEach((dbDate) => {
    const dateKey = new Date(dbDate.date).toISOString().split("T")[0];
    existingSchedule.set(dateKey, {
      id: dbDate.id,
      times: new Set(dbDate.poll_times.map((t) => t.time)),
      timeIds: new Map(dbDate.poll_times.map((t) => [t.time, t.id])),
    });
  });

  // 4. Identify what to delete
  const dateIdsToDelete = [];
  const timeIdsToDelete = [];

  for (const [dateKey, dbData] of existingSchedule.entries()) {
    if (!newSchedule.has(dateKey)) {
      // This entire date is deleted
      dateIdsToDelete.push(dbData.id);
    } else {
      // Date exists, check which times are deleted
      const newTimes = newSchedule.get(dateKey).times;
      for (const dbTime of dbData.times) {
        if (!newTimes.has(dbTime)) {
          timeIdsToDelete.push(dbData.timeIds.get(dbTime));
        }
      }
    }
  }

  // 5. Perform deletions
  if (timeIdsToDelete.length > 0) {
    const { error } = await supabase
      .from("poll_times")
      .delete()
      .in("id", timeIdsToDelete);
    if (error)
      throw new Error(`Error deleting old poll times: ${error.message}`);
  }
  if (dateIdsToDelete.length > 0) {
    const { error } = await supabase
      .from("poll_dates")
      .delete()
      .in("id", dateIdsToDelete);
    if (error)
      throw new Error(`Error deleting old poll dates: ${error.message}`);
  }

  // 6. Identify what to add
  for (const [dateKey, newData] of newSchedule.entries()) {
    if (!existingSchedule.has(dateKey)) {
      // This is a completely new date, add it and all its times
      const { data: newPollDate, error: newDateError } = await supabase
        .from("poll_dates")
        .insert({ date: newData.isoDate, poll_id })
        .select("id")
        .single();
      if (newDateError)
        throw new Error(`Error adding new poll date: ${newDateError.message}`);

      if (newData.times.size > 0) {
        const timesToInsert = Array.from(newData.times).map((time) => ({
          time,
          poll_date_id: newPollDate.id,
        }));
        const { error: timeError } = await supabase
          .from("poll_times")
          .insert(timesToInsert);
        if (timeError)
          throw new Error(
            `Error adding times for new date: ${timeError.message}`
          );
      }
    } else {
      // Date exists, check for new times to add
      const existingData = existingSchedule.get(dateKey);
      const timesToInsert = [];
      for (const newTime of newData.times) {
        if (!existingData.times.has(newTime)) {
          timesToInsert.push({ time: newTime, poll_date_id: existingData.id });
        }
      }
      if (timesToInsert.length > 0) {
        const { error: timeError } = await supabase
          .from("poll_times")
          .insert(timesToInsert);
        if (timeError)
          throw new Error(`Error adding new poll times: ${timeError.message}`);
      }
    }
  }
};
const addPollMembers = async ({ user_ids, poll_id }) => {
  const { error } = await supabase.from("user_polls").insert(
    user_ids.map((user_id) => ({
      user_id,
      poll_id,
    }))
  );
  if (error) throw `Error adding poll members: ${error.message}`;
  return { message: "Poll members added successfully" };
};

const fetchPolls = async ({ user_id }) => {
  const { data: publicPolls, error: fetchError } = await supabase
    .from("polls")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });
  if (fetchError) {
    throw new Error(fetchError.message);
  }
  // Fetch private polls for the user
  const { data: privatePolls, error: privateFetchError } = await supabase
    .from("user_polls")
    .select("polls(*)")
    .eq("user_id", user_id);
  if (privateFetchError) {
    throw new Error(privateFetchError.message);
  }

  // Combine public and private polls
  const polls = [...publicPolls, ...privatePolls.map((p) => p.polls)];

  const { count: pollAnswerCount, error: pollAnswerCountError } = await supabase
    .from("poll_answers")
    .select("*", { count: "exact", head: true })
    .in(
      "poll_id",
      polls.map((poll) => poll.id)
    );

  if (pollAnswerCountError) {
    throw new Error(pollAnswerCountError.message);
  }
  const pollsWithAnswerCount = polls.map((poll) => {
    return { ...poll, answer_count: pollAnswerCount ? pollAnswerCount : 0 };
  });

  return pollsWithAnswerCount;
};

const fetchPollsByUser = async ({ user_id }) => {
  const { data: userPolls, error: fetchError } = await supabase
    .from("polls")
    .select("*")
    .eq("creator_id", user_id);
  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const polls = await Promise.all(
    userPolls.map(async (poll) => {
      const { data: pollAnswers, error: AnswersError } = await supabase
        .from("poll_answers")
        .select("user_id")
        .eq("poll_id", poll.id);

      if (AnswersError) {
        throw new Error(AnswersError.message);
      }

      // Filter out answers with the same user_id
      const uniqueUserIds = new Set();
      const filteredAnswers = pollAnswers.filter((answer) => {
        if (!uniqueUserIds.has(answer.user_id)) {
          uniqueUserIds.add(answer.user_id);
          return true; // Keep this answer
        }
        return false; // Discard this answer
      });

      poll.answer_count = filteredAnswers.length;
      return poll;
    })
  );

  return polls;
};

const fetchPoll = async ({ poll_id, user_id }) => {
  const { data: poll, error: fetchError } = await supabase
    .from("polls")
    .eq("id", poll_id)
    .select("*, poll_dates(*, poll_times(*))")
    .single();
  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!poll) {
    throw new Error("Poll not found");
  }
  const pollAnswers = await fetchPollAnswers({ poll_id, user_id });
  poll.poll_answers = pollAnswers;

  return poll;
};

// const answerPoll = async ({
//   poll_id,
//   user_id,
//   answers = [
//     {
//       poll_date_id,
//       poll_time_id,
//       answer,
//     },
//   ],
// }) => {
//   const { data: pollExist, error: existError } = await supabase
//     .from("polls")
//     .select("id")
//     .eq("id", poll_id)
//     .maybeSingle();
//   if (existError) {
//     throw new Error("Error checking poll existence: " + existError.message);
//   }
//   if (!pollExist) {
//     throw new Error("Poll does not exist");
//   }
//   const { data: userPollExist, error: userPollError } = await supabase
//     .from("user_polls")
//     .select("id")
//     .eq("user_id", user_id)
//     .eq("poll_id", poll_id)
//     .maybeSingle();
//   if (userPollError) {
//     throw new Error(
//       "Error checking user poll existence: " + userPollError.message
//     );
//   }

//   if (userPollExist) {
//     throw new Error("You have already answered this poll");
//   }

//   const { error: insertError } = await supabase.from("poll_answers").insertMany(
//     answers.map((userAnswer) => ({
//       poll_date_id: userAnswer.poll_date_id,
//       poll_time_id: userAnswer.poll_time_id,
//       poll_user_id: userAnswer.answer,
//       user_id,
//       poll_id,
//     }))
//   );

//   if (insertError) throw insertError.message;

//   return { message: "Poll answered successfully" };
// };

const answerSinglePoll = async ({
  id,
  poll_id,
  user_id,
  poll_date_id,
  poll_time_id,
  answer,
}) => {
  const { data: pollExist, error: existError } = await supabase
    .from("polls")
    .select("id, expiration_date")
    .eq("id", poll_id)
    .maybeSingle();
  if (existError) {
    throw new Error(existError.message);
  }
  if (!pollExist) {
    throw new Error("Poll does not exist");
  }

  // Check if poll is expired
  if (
    pollExist.expiration_date &&
    new Date(pollExist.expiration_date) < new Date()
  ) {
    throw new Error("This poll has expired. Voting is no longer available.");
  }
  // const { data: userPollExist, error: userPollError } = await supabase
  //   .from("poll_answers")
  //   .select("id")
  //   .eq("user_id", user_id)
  //   .eq("poll_id", poll_id)
  //   .eq("poll_date_id", poll_date_id)
  //   .eq("poll_time_id", poll_time_id)
  //   .maybeSingle();
  // if (userPollError) {
  //   throw new Error(
  //     `Error checking user poll existence: ${userPollError.message}`
  //   );
  // }
  // if (userPollExist) {
  //   throw new Error("You have already answered this poll");
  // }

  const { error: insertError } = await supabase.from("poll_answers").upsert({
    id,
    poll_date_id,
    poll_time_id,
    answer,
    user_id,
    poll_id,
  });
  if (insertError)
    throw new Error(`Error answering poll: ${insertError.message}`);
};

const fetchPollUserAnswers = async ({ poll_time_id, user_id }) => {
  const { data: pollAnswers, error: fetchError } = await supabase
    .from("poll_answers")
    .select("*")
    .eq("poll_time_id", poll_time_id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  return pollAnswers;
};
const fetchPollDates = async ({ poll_id }) => {
  const { data: pollDates, error: fetchError } = await supabase
    .from("poll_dates")
    .select("*, poll_times(*)")
    .eq("poll_id", poll_id)
    .order("date", { ascending: true });
  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!pollDates || pollDates.length === 0) {
    throw new Error("No poll dates found for this poll");
  }
  return pollDates;
};

const fetchPollAnswers = async ({ poll_date_id, poll_time_id }) => {
  const { data: pollUserAnswers, error: fetchError } = await supabase
    .from("poll_answers")
    .select("answer, users(first_name, last_name)")
    .eq("poll_date_id", poll_date_id)
    .eq("poll_time_id", poll_time_id);

  if (fetchError) {
    throw new Error(`Error fetching poll user answers: ${fetchError.message}`);
  }

  const available = pollUserAnswers.filter((pollUserAnswer) => {
    if (pollUserAnswer.answer === "available") {
      return `${pollUserAnswer.users?.first_name} ${pollUserAnswer.users?.last_name}`;
    }
  });

  const ifneeded = pollUserAnswers.filter((pollUserAnswer) => {
    if (pollUserAnswer.answer === "ifneeded") {
      return `${pollUserAnswer.users.first_name} ${pollUserAnswer.users?.last_name}`;
    }
  });
  const unavailable = pollUserAnswers.filter((pollUserAnswer) => {
    if (pollUserAnswer.answer === "unavailable") {
      return `${pollUserAnswer.users?.first_name} ${pollUserAnswer.users.last_name}`;
    }
  });
  const mostAvailable =
    available.length > ifneeded.length ? available : ifneeded;
  const mostUnavailable =
    available.length < ifneeded.length ? available : ifneeded;
  const availableCount = available.length;
  const ifneededCount = ifneeded.length;
  const unavailableCount = unavailable.length;
  const availablePercent = Math.round(
    (availableCount / pollUserAnswers.length) * 100
  );
  const unavailablePercent = Math.round(
    (unavailableCount / pollUserAnswers.length) * 100
  );
  const ifneededPercent = Math.round(
    (ifneededCount / pollUserAnswers.length) * 100
  );

  const pollAnswers = {
    available,
    ifneeded,
    unavailable,
    availableCount,
    ifneededCount,
    unavailableCount,
    mostAvailable,
    mostUnavailable,
    availablePercent,
    unavailablePercent,
    ifneededPercent,
  };
  return pollAnswers;
};

/**
 * Fetch only the most available date and time for a poll
 * @param {string} poll_id - The ID of the poll
 * @returns {Promise<Object>} Object containing only the most available date and time
 */
const fetchPollAvailabilitySummary = async (poll_id) => {
  try {
    // 1. Get all dates and times for this poll
    const pollDates = await fetchPollDates({ poll_id });

    // 2. Track best options only
    let bestDate = null;
    let bestTime = null;
    let highestAvailabilityScore = -1;

    // 3. Process each date and its times
    for (const dateObj of pollDates) {
      const date = new Date(dateObj.date);
      const formattedDate = date.toLocaleDateString();

      let totalAvailable = 0;
      let totalIfNeeded = 0;
      let totalUnavailable = 0;
      let totalResponses = 0;
      let bestTimeForThisDate = null;
      let bestTimeScore = -1;

      // Process each time slot for this date
      for (const timeSlot of dateObj.poll_times) {
        // Get answers for this specific time slot
        const answers = await fetchPollAnswers({
          poll_date_id: dateObj.id,
          poll_time_id: timeSlot.id,
        });

        // Calculate time slot score
        const responses =
          answers.availableCount +
          answers.ifneededCount +
          answers.unavailableCount;
        const timeScore =
          responses > 0
            ? (answers.availableCount + answers.ifneededCount * 0.5) / responses
            : 0;

        // Check if this is the best time for this date
        if (timeScore > bestTimeScore) {
          bestTimeScore = timeScore;
          bestTimeForThisDate = {
            time_id: timeSlot.id,
            time: timeSlot.time,
            availableCount: answers.availableCount,
            ifneededCount: answers.ifneededCount,
            unavailableCount: answers.unavailableCount,
            score: timeScore,
          };
        }

        // Add to the totals for this date
        totalAvailable += answers.availableCount;
        totalIfNeeded += answers.ifneededCount;
        totalUnavailable += answers.unavailableCount;
        totalResponses += responses;
      }

      // Calculate the date's availability score
      const availabilityScore =
        totalResponses > 0
          ? (totalAvailable + totalIfNeeded * 0.5) / totalResponses
          : 0;

      // Check if this is the best date overall
      if (availabilityScore > highestAvailabilityScore) {
        highestAvailabilityScore = availabilityScore;
        bestDate = {
          date_id: dateObj.id,
          date: formattedDate,
          rawDate: dateObj.date,
          availabilityScore,
          totalAvailable,
          totalIfNeeded,
          totalUnavailable,
          totalResponses,
        };
        bestTime = bestTimeForThisDate;
      }
    }

    // Just return the best date and time
    return {
      bestDate,
      bestTime,
    };
  } catch (error) {
    console.error("Error fetching poll availability summary:", error);
    throw new Error(`Error finding most available date: ${error.message}`);
  }
};

const addTimeSlot = async ({ poll_date_id, time }) => {
  const { error } = await supabase.from("poll_times").insert({
    poll_date_id,
    time,
  });

  if (error) throw `Error adding time slot: ${error.message}`;

  return { message: "Time slot added successfully" };
};

const manualClosePoll = async (poll_id) => {
  if (!poll_id) {
    throw new Error("Poll ID is required");
  }

  try {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("polls")
      .update({ expiration_date: now })
      .eq("id", poll_id);

    if (error) throw error.message;

    return { message: "Poll closed successfully" };
  } catch (error) {
    throw new Error(`Error closing poll: ${error.message}`);
  }
};

const fetchPollMinistries = async (poll_id) => {
  const { data: ministries, error } = await supabase
    .from("poll_ministries")
    .select("id, ministries(id, ministry_name)")
    .eq("poll_id", poll_id);

  if (error) {
    throw new Error(`Error fetching poll ministries: ${error.message}`);
  }

  return ministries;
};

const fetchPollGroups = async (poll_id) => {
  const { data: groups, error } = await supabase
    .from("poll_groups")
    .select("id, groups(id, name, ministries(ministry_name))")
    .eq("poll_id", poll_id);

  if (error) {
    throw new Error(`Error fetching poll groups: ${error.message}`);
  }

  return groups;
};

const finalisePoll = async ({ pollId, pollDate, pollTime }) => {
  const token = await getAuthToken();
  try {
    const { data: result } = await axios.post(
      `${import.meta.env.VITE_SPARKD_API_URL}/poll/finalize-poll`,
      // `http://localhost:3000/poll/finalize-poll`,
      {
        pollId,
        pollDate,
        pollTime,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      message: "Email successfully sent",
      details: result,
    };
  } catch (error) {
    console.error("Error in finalising poll:", error);
    throw new Error(
      error.response?.data?.message || "Failed to finalise poll request"
    );
  }
};

export {
  fetchPollMinistries,
  fetchPollGroups,
  addPoll,
  editPolls,
  fetchPolls,
  answerSinglePoll,
  fetchPollAnswers,
  deletePoll,
  fetchPoll,
  fetchPollUserAnswers,
  fetchPollsByUser,
  fetchPollDates,
  addTimeSlot,
  manualClosePoll,
  fetchPollAvailabilitySummary,
  finalisePoll,
};
