import { supabase } from "./supabaseClient"; // Ensure you're using the correct import for your Supabase client

const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  contactNumber,
}) => {
  try {
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw signUpError;
    }

    // Insert user details into the 'users' table, matching the correct column names
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: user.user.id, // Use the UUID generated by Supabase Auth
        email: user.user.email, // Use the email returned by Supabase
        name: `${firstName} ${lastName}`, // Full name
        contact_number: contactNumber, // Contact number
        role: "parishioner", // Example role ID, replace as needed
        is_confirmed: false, // Assuming you want to confirm users manually
        is_active: true, // New users are active by default
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    return user; // Return user data after sign-up and insertion
  } catch (error) {
    console.error("Error during sign-up:", error);
  }
};

export { registerUser };