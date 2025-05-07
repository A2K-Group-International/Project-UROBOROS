import { useUser } from "@/context/useUser";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import PropTypes from "prop-types";
import useComment from "@/hooks/useComment";

const CommentInput = ({ announcement_id, isModal }) => {
  const { register, handleSubmit, reset } = useForm();
  const { userData } = useUser();
  const [isCommenting, setIsCommenting] = useState(false);
  const { addCommentMutation } = useComment(announcement_id, null);

  // Create a unique input name for modal vs non-modal
  const inputName = isModal
    ? `modal_comment${announcement_id}`
    : `comment${announcement_id}`;

  return (
    <div className="mt-2 flex-grow">
      <form
        onSubmit={handleSubmit((data) =>
          addCommentMutation.mutate({
            comment: data[inputName],
            user_id: userData.id,
            announcement_id,
            setIsCommenting,
            reset,
          })
        )}
        id={inputName}
        className="flex-1"
      >
        <Textarea
          className="resize-none rounded-2xl border-accent/30 bg-white md:bg-primary"
          {...register(inputName, { required: true })}
          onFocus={() => setIsCommenting(true)}
          name={inputName}
          placeholder="Write a comment..."
        />
      </form>

      {isCommenting && (
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => setIsCommenting(false)}
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            disabled={addCommentMutation.isPending}
            type="submit"
            form={inputName}
            className="bg-accent"
          >
            {addCommentMutation.isPending ? "Commenting..." : "Comment"}
          </Button>
        </div>
      )}
    </div>
  );
};

CommentInput.propTypes = {
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isModal: PropTypes.bool,
};

export default CommentInput;
