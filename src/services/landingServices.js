import { supabase } from "./supabaseClient"

export const getTrainingVideo = () => {
 const { data } = supabase.storage.from("Uroboros").getPublicUrl("training_video/creating_parishioner_account.mp4")

 return data.publicUrl
}