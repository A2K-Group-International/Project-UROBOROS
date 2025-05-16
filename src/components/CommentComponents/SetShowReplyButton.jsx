import PropTypes from "prop-types";

const SetShowReplyButton = ({ replyCount, showReply, setShowReply }) => {
  return (
    <button
      type="button"
      onClick={() => setShowReply((prevState) => !prevState)}
      className="mb-1 w-fit rounded-2xl px-1 text-accent hover:underline"
    >
      {showReply ? "Hide Replies" : `Show Replies (${replyCount})`}
    </button>
  );
};
SetShowReplyButton.propTypes = {
  replyCount: PropTypes.number.isRequired,
  showReply: PropTypes.bool.isRequired,
  setShowReply: PropTypes.func.isRequired,
};
export default SetShowReplyButton;
