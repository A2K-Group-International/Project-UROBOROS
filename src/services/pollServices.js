import { supabase } from "./supabaseClient";

const addPoll = async ({
  pollName,
  pollDescription,
  visibility = "PUBLIC",
  creator_id,
  timeSlots,
  pollDates,
  pollDateExpiry,
  user_ids,
}) => {
  //date to isostring
  const expiration_date = new Date(pollDateExpiry).toISOString();
  const { data: poll, error } = await supabase
    .from("polls")
    .insert({
      name: pollName,
      description: pollDescription,
      visibility,
      creator_id,
      expiration_date,
    })
    .select("id")
    .single();

  if (error) throw error.message;

  await addPollDates({ times: timeSlots, dates: pollDates, poll_id: poll.id });

  if (visibility === "PRIVATE") {
    await addPollMembers({ user_ids, poll_id: poll.id });
  }

  return { message: "Poll created successfully" };
};

const editPolls = async ({
  id,
  name,
  description,
  dates,
  times,
  visibility,
}) => {
  const { data: pollExist, existError } = await supabase
    .from("polls")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existError) {
    throw new Error(existError.message);
  }

  if (!pollExist) {
    throw new Error("Poll does not exist");
  }

  const { error } = await supabase
    .from("polls")
    .update({
      name,
      description,
      visibility,
    })
    .eq("id", id);

  await editPollDates({ dates, poll_id: id });

  await editPollTimes({ times, poll_date_id: id });

  if (error) throw error.message;

  return { message: "Poll updated successfully" };
};

const deletePoll = async (id) => {
  const { data: pollExist, error: existError } = await supabase
    .from("polls")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (existError) {
    throw new Error(existError.message);
  }
  if (!pollExist) {
    throw new Error("Poll does not exist");
  }

  const { error } = await supabase.from("polls").delete().eq("id", id);

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
const editPollDates = async ({ dates, poll_id }) => {
  const { data: pollExist, error: existError } = await supabase
    .from("poll_dates")
    .select("id")
    .eq("poll_id", poll_id);

  if (existError) {
    throw new Error(existError.message);
  }
  if (!pollExist || pollExist.length === 0) {
    throw new Error("Poll date does not exist");
  }
  // Delete existing dates for the poll
  const { error } = await supabase
    .from("poll_dates")
    .delete()
    .eq("poll_id", poll_id);
  if (error) throw error.message;

  // Insert new dates for the poll
  const { error: insertError } = await supabase.from("poll_dates").insertMany(
    dates.map((date) => ({
      date,
      poll_id,
    }))
  );
  if (insertError) throw insertError.message;

  return { message: "Poll date updated successfully" };
};

// const addPollTimes = async ({ times, poll_date_id }) => {
//   const { error: insertError } = await supabase.from("poll_times").insertMany(
//     times.map((time) => ({
//       time,
//       poll_date_id,
//     }))
//   );
//   if (insertError) throw insertError.message;
// };
const editPollTimes = async (times, poll_date_id) => {
  const { data: pollDateExist, error: existError } = await supabase
    .from("poll_times")
    .eq("poll_date_id", poll_date_id);

  if (existError) {
    throw new Error(existError.message);
  }

  if (!pollDateExist || pollDateExist.length === 0) {
    throw new Error("Poll time does not exist");
  }
  // Delete existing times for the poll date
  const { error } = await supabase
    .from("poll_times")
    .delete()
    .eq("poll_date_id", poll_date_id);
  if (error) throw error.message;
  // Insert new times for the poll date
  const { error: insertError } = await supabase.from("poll_times").insertMany(
    times.map((time) => ({
      time,
      poll_date_id,
    }))
  );
  if (insertError) throw insertError.message;

  return { message: "Poll time updated successfully" };
};

const addPollMembers = async ({ user_ids, poll_id }) => {
  const { error } = await supabase.from("user_polls").insertMany(
    user_ids.map((user_id) => ({
      user_id,
      poll_id,
    }))
  );
  if (error) throw error.message;
  return { message: "Poll members added successfully" };
};

const fetchPolls = async ({ user_id }) => {
  const { data: publicPolls, error: fetchError } = await supabase
    .from("polls")
    .select("*")
    .eq("visibility", "PUBLIC")
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
    //     const answerCount = pollAnswerCount.filter(
    //       (answer) => answer.poll_id === poll.id
    //     ).length;
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
  poll_id,
  user_id,
  poll_date_id,
  poll_time_id,
  answer,
}) => {
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
  const { data: userPollExist, error: userPollError } = await supabase
    .from("user_polls")
    .select("id")
    .eq("user_id", user_id)
    .eq("poll_id", poll_id)
    .maybeSingle();
  if (userPollError) {
    throw new Error(userPollError.message);
  }
  if (userPollExist) {
    throw new Error("You have already answered this poll");
  }

  const { error: insertError } = await supabase
    .from("poll_answers")
    .upsert({
      poll_date_id,
      poll_time_id,
      answer,
      user_id,
      poll_id,
    })
    .eq("user_id", user_id)
    .eq("poll_id", poll_id);
  if (insertError) throw insertError.message;
};

const fetchPollAnswers = async ({ poll_id, user_id }) => {
  const { data: pollAnswers, error: fetchError } = await supabase
    .from("poll_answers")
    .select("*")
    .eq("poll_id", poll_id)
    .eq("user_id", user_id);

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  return pollAnswers;
};

const fetchPollUserAnswers = async ({
  poll_date_id,
  poll_time_id,
  user_id,
}) => {
  const { data: pollUserAnswers, error: fetchError } = await supabase
    .from("poll_answers")
    .select(
      "answer, users(first_name, last_name), poll_dates(date), poll_times(time)"
    )
    .eq("poll_date_id", poll_date_id)
    .eq("poll_time_id", poll_time_id)
    .eq("user_id", user_id);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const available = pollUserAnswers.map((pollUserAnswer) => {
    if (pollUserAnswer.answer === "AVAILABLE") {
      return `${pollUserAnswer.users.first_name} ${pollUserAnswer.users.last_name}`;
    }
  });

  const ifneeded = pollUserAnswers.map((pollUserAnswer) => {
    if (pollUserAnswer.answer === "IFNEEDED") {
      return `${pollUserAnswer.users.first_name} ${pollUserAnswer.users.last_name}`;
    }
  });
  const unavailable = pollUserAnswers.map((pollUserAnswer) => {
    if (pollUserAnswer.answer === "UNAVAILABLE") {
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

  const pollAnswers = {
    available,
    ifneeded,
    unavailable,
    availableCount,
    ifneededCount,
    unavailableCount,
    mostAvailable,
    mostUnavailable,
  };
  return pollAnswers;
};

export {
  addPoll,
  editPolls,
  fetchPolls,
  answerSinglePoll,
  fetchPollAnswers,
  deletePoll,
  fetchPoll,
  fetchPollUserAnswers,
};
