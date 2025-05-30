import { Button } from "../ui/button";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Textarea } from "../ui/textarea";

const EditCommentForm = ({
  comment_id,
  setEditting,
  InputDefaultValue,
  handleUpdateComment,
}) => {
  const { register, handleSubmit, setValue } = useForm();
  // const { handleUpdateComment } = useComment(announcement_id);

  useEffect(() => {
    if (InputDefaultValue) {
      setValue("comment", InputDefaultValue);
    }
  }, []);
  return (
    <form
      onSubmit={handleSubmit((inputs) =>
        handleUpdateComment(inputs, comment_id, setEditting)
      )}
      className="mb-2 flex w-full flex-col gap-2 p-1"
    >
      <Textarea {...register("comment", { required: true })} name="comment" />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant={"outline"}
          onClick={() => setEditting(false)}
        >
          Cancel
        </Button>
        <Button type="submit" className="hover:bg-blue-500 bg-accent">
          Save
        </Button>
      </div>
    </form>
  );
};

EditCommentForm.propTypes = {
  comment_id: PropTypes.string.isRequired,
  setEditting: PropTypes.func.isRequired,
  InputDefaultValue: PropTypes.string,
  handleUpdateComment: PropTypes.func.isRequired,
};

export default EditCommentForm;
