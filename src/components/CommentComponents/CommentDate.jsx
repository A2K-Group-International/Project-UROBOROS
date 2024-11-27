import PropTypes from 'prop-types';
 
 const CommentDate = ({ date, isEdited }) => {
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    const timeFrames = [
      { unit: 'year', seconds: 60 * 60 * 24 * 365 },
      { unit: 'month', seconds: 60 * 60 * 24 * 30 },
      { unit: 'week', seconds: 60 * 60 * 24 * 7 },
      { unit: 'day', seconds: 60 * 60 * 24 },
      { unit: 'hour', seconds: 60 * 60 },
      { unit: 'minute', seconds: 60 },
    ];

    for (const { unit, seconds } of timeFrames) {
      const count = Math.floor(diffInSeconds / seconds);
      if (count !== 0) {
        return `${count} ${unit}${count !== 1 ? 's' : ''} ago`;
      }
    }
    // for very recent
    return 'just now'; 
  };

  return (
    <div className="flex gap-1">
      <p className="text-xs text-accent opacity-75">
        {formatRelativeTime(date)}
      </p>
      {isEdited && (
        <p className="text-xs text-slate-500">(Edited)</p>
      )}
    </div>
  );
}

CommentDate.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  isEdited: PropTypes.bool.isRequired,
};


export default CommentDate;
