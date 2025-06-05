import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import "./TimePickerv2.css";

const TimePickerv2 = ({ setTime, setActivity }) => {
  const [hourScroll, setHourScroll] = useState(0);
  const [minuteScroll, setMinuteScroll] = useState(0);
  const [timePicker] = useState(true);

  // Full 24-hour range
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourRefs = useRef(hours.map(() => ({ current: null })));
  const minuteRefs = useRef(minutes.map(() => ({ current: null })));

  const date = new Date();
  const mm = date.getMinutes();
  const hh = date.getHours();

  useEffect(() => {
    // Set initial scroll position to current time
    document.getElementById(`m ${mm}`)?.scrollIntoView({ block: "center" });
    document.getElementById(`h ${hh}`)?.scrollIntoView({ block: "center" });
  }, [hh, mm]);

  return (
    <>
      <div
        className={`timePickerOverlay ${timePicker ? "active" : "inactive"}`}
      >
        <div
          className="modalCardTime"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="timeContainer">
            <div
              className="hourRoller"
              onClick={(e) => {
                e.scrollTop += 80;
              }}
              onScroll={(e) => {
                setHourScroll(
                  Math.floor((e.target.scrollTop - 104) / 80) > 23
                    ? 23
                    : Math.floor((e.target.scrollTop - 104) / 80) < 0
                      ? 0
                      : Math.floor((e.target.scrollTop - 104) / 80)
                );
              }}
            >
              <div className="hourItemsContainer">
                {hours.map((hour, index) => (
                  <p
                    key={`hour-${hour}`}
                    id={`h ${hour}`}
                    ref={(el) => (hourRefs.current[index] = el)}
                    className={`timeRoller ${hourScroll === hour ? "selected" : ""}`}
                    onClick={() => {
                      document.getElementById(`h ${hour}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    {hour < 10 ? `0${hour}` : hour}
                  </p>
                ))}
              </div>

              <p className="timeRollerMargin">.</p>
            </div>

            <p className="separator">:</p>

            <div
              className="hourRoller"
              onScroll={(e) => {
                setMinuteScroll(
                  Math.floor((e.target.scrollTop - 104) / 80) > 59
                    ? 59
                    : Math.floor((e.target.scrollTop - 104) / 80) < 0
                      ? 0
                      : Math.floor((e.target.scrollTop - 104) / 80)
                );
              }}
            >
              <div className="hourItemsContainer">
                {minutes.map((minute, index) => (
                  <p
                    key={`minute-${minute}`}
                    id={`m ${minute}`}
                    ref={(el) => (minuteRefs.current[index] = el)}
                    className={`timeRoller ${minuteScroll === minute ? "selected" : ""}`}
                    onClick={() => {
                      document.getElementById(`m ${minute}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    {minute < 10 ? `0${minute}` : minute}
                  </p>
                ))}
              </div>

              <p className="timeRollerMargin">.</p>
            </div>
            <div className="timeJump">
              <p
                className="jump j0"
                onClick={() => {
                  document
                    .getElementById("m 0")
                    ?.scrollIntoView({ block: "center" });
                }}
              >
                00
              </p>
              <p
                className="jump j30"
                onClick={() => {
                  document
                    .getElementById("m 30")
                    ?.scrollIntoView({ block: "center" });
                }}
              >
                30
              </p>
              <p
                className="jump j59"
                onClick={() => {
                  document
                    .getElementById("m 59")
                    ?.scrollIntoView({ block: "center" });
                }}
              >
                59
              </p>
            </div>
          </div>

          <div className="actionBtns">
            <button
              className="cancelBtn"
              onClick={() => {
                setActivity(false);
              }}
            >
              Close
            </button>
            <button
              className="saveBtn"
              onClick={() => {
                const timeString = `${
                  hourScroll < 10 ? `0${hourScroll}` : hourScroll
                }:${minuteScroll < 10 ? `0${minuteScroll}` : minuteScroll}`;
                setTime(timeString);
                setActivity(false);
              }}
            >
              Set Time
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

TimePickerv2.propTypes = {
  setTime: PropTypes.func.isRequired,
  setActivity: PropTypes.func.isRequired,
};

export default TimePickerv2;
