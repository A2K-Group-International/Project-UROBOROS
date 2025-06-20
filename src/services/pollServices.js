import { getMinistriesMembers } from "./ministryService";
import { supabase } from "./supabaseClient";
import { fetchGroupsMembers } from "./groupServices";

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
  console.log("poll id", pollId);
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
  const { error: deleteError } = await supabase
    .from("poll_dates")
    .delete()
    .eq("poll_id", poll_id);

  if (deleteError) {
    throw new Error(
      `Error deleting previous poll dates: ${deleteError.message}`
    );
  }

  await addPollDates({ dates, times, poll_id });
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

  const { count: pollAnswerCount, error: pollAnswerCountError } = await supabase
    .from("poll_answers")
    .select("*", { count: "exact", head: true })
    .in(
      "poll_id",
      userPolls.map((poll) => poll.id)
    );
  if (pollAnswerCountError) {
    throw new Error(pollAnswerCountError.message);
  }
  const pollsWithAnswerCount = userPolls.map((poll) => {
    return { ...poll, answer_count: pollAnswerCount ? pollAnswerCount : 0 };
  });

  return pollsWithAnswerCount;
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
      return `${pollUserAnswer.users.first_name} ${pollUserAnswer.users.last_name}`;
    }
  });

  const ifneeded = pollUserAnswers.filter((pollUserAnswer) => {
    if (pollUserAnswer.answer === "ifneeded") {
      return `${pollUserAnswer.users.first_name} ${pollUserAnswer.users.last_name}`;
    }
  });
  const unavailable = pollUserAnswers.filter((pollUserAnswer) => {
    if (pollUserAnswer.answer === "unavailable") {
      return `${pollUserAnswer.users.first_name} ${pollUserAnswer.users.last_name}`;
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
};
