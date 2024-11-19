import { supabase } from './supabaseClient'; // Supabase client import

// Register user
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

    if (signUpError) throw signUpError;

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

    if (insertError) throw insertError;

    return user;
  } catch (error) {
    console.error("Error during sign-up:", error);
  }
};

// Login user
const loginUser = async ({ email, password }) => {
  try {
    // Authenticate the user
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return user; // Return only the authenticated user data
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error; // Let the calling context handle errors
  }
};

// Logout user
const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    console.log('User logged out successfully');
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export { registerUser, loginUser, logoutUser };
