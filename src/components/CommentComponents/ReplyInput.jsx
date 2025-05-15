import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useUser } from "@/context/useUser";
import PropTypes from "prop-types";

const ReplyInput = ({
  comment_id,
  isReplying,
  setIsReplying,
  setEditting,
  addReplyMutation,
  announcement_id,
}) => {
  const { userData } = useUser();
  const { register, reset, handleSubmit } = useForm();

  // useEffect(() => {
  //   if (replyTo) {
  //     setValue("reply", `@${replyTo} `);
  //   }
  // }, []);

  return (
    <div className="mr-2 mt-5 flex flex-col gap-2">
      {isReplying && (
        <form
          onSubmit={handleSubmit((inputs) =>
            addReplyMutation.mutate(
              {
                reply: inputs.reply,
                user_id: userData.id,
                comment_id,
                announcement_id,
              },
              {
                onSuccess: () => {
                  setIsReplying(false);
                  setEditting(false);
                  reset();
                },
              }
            )
          )}
          className="flex"
        >
          <div className="flex flex-grow flex-col gap-2">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  className=""
                  src={userData?.user_image ?? ""}
                  alt="user image"
                />
                <AvatarFallback className="bg-accent text-white">
                  {getInitial(userData?.first_name)}
                </AvatarFallback>
              </Avatar>
              <Input
                {...register("reply", { required: true })}
                name="reply"
                placeholder="type your reply here"
              ></Input>
            </div>

            <div className="flex justify-end">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  variant={"outline"}
                >
                  Cancel
                </Button>
                <Button
                  disabled={addReplyMutation.isPending}
                  type="submit"
                  className="bg-accent"
                >
                  {addReplyMutation.isPending ? "Replying..." : "Reply"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
ReplyInput.propTypes = {
  comment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isReplying: PropTypes.bool.isRequired,
  setIsReplying: PropTypes.func.isRequired,
  setEditting: PropTypes.func.isRequired,
  replyTo: PropTypes.string,
  addReplyMutation: PropTypes.object,
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default ReplyInput;
