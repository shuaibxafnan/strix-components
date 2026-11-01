"use client";

import { useState } from "react";

const RULE_TESTS = {
  charLength: (v, min) => v.length >= min,
  lowercase: (v) => /[a-z]/.test(v),
  uppercase: (v) => /[A-Z]/.test(v),
  number: (v) => /[0-9]/.test(v),
};

export default function PasswordGuide({
  minLength = 7,
  placeholder = "Password",
  lengthLabel = "Characters",
  lowercaseLabel = "1 lowercase",
  uppercaseLabel = "1 UPPERCASE",
  numberLabel = "1 Number",
  showLabel = "SHOW",
  hideLabel = "HIDE",
  className = "",
  bgColor = "#553E8F",
  inputBg = "#3A296A",
  inputRadius = "14px",
  inputColor = "#ffffff",
  placeholderColor = "#AD9ED3",
  listBg = "#ffffff",
  listBorderColor = "#CFDAE1",
  listLineColor = "#E45998",
  listTextColor = "#423666",
  listRuleColor = "#D8CBF5",
  strikeColor = "#70D5B9",
  checkFill = "#70D5B9",
  showHideColor = "#f6bd41",
  notebookFill = "#3A296A",
  lockBodyFill = "#F6BD41",
  lockShackleFill = "#E3488B",
}) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  const rules = [
    { id: "charLength", label: `${minLength} ${lengthLabel}` },
    { id: "lowercase", label: lowercaseLabel },
    { id: "uppercase", label: uppercaseLabel },
    { id: "number", label: numberLabel },
  ];
  const results = rules.map((r) => ({
    ...r,
    valid: RULE_TESTS[r.id](value, minLength),
  }));
  const allValid = results.every((r) => r.valid);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
      />

      <style>{`
        .pg-placeholder::placeholder { color: ${placeholderColor}; }
        .pg-strike::after {
          content: '';
          width: 100%;
          height: 3px;
          background: ${strikeColor};
          position: absolute;
          left: 0;
          top: 3px;
          transform-origin: left;
          transform: scaleX(0);
          transition: transform .4s ease;
        }
        .pg-strike.valid::after { transform: scaleX(1); }
        .pg-check {
          transform: scale(0);
          transition: transform .3s cubic-bezier(.86,.45,.72,1.2);
        }
        .pg-check.valid { transform: scale(1); }
      `}</style>

      <div
        className={`w-full h-screen flex flex-col items-center justify-center font-sans ${className}`}
        style={{ background: bgColor }}
      >
        <div>
                    <div className="relative w-[250px] h-[160px]">
                        <div
              className="absolute top-[25px] left-[52px] w-[194px] h-[120px] rounded-[6px] overflow-hidden [-rotate-[5deg]]"
              style={{
                background: listBg,
                boxShadow: `inset 3px 0 0 ${listBorderColor}`,
                fontFamily: "'Special Elite', cursive",
                fontSize: "12px",
                transform: "rotate(-5deg) translate3d(0,0,0)",
              }}
            >
                            <div
                className="absolute top-0 left-[22px] w-[2px] h-full"
                style={{ background: listLineColor }}
              />
              <ul className="pt-[13px] pl-0 list-none">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="pl-[34px] pb-[3px] mb-[6px]"
                    style={{ borderBottom: `1px solid ${listRuleColor}` }}
                  >
                    <span
                      className={`pg-strike relative${r.valid ? " valid" : ""}`}
                      style={{ color: listTextColor }}
                    >
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

                        <svg
              className={`pg-check absolute top-[84px] right-[10px]${allValid ? " valid" : ""}`}
              width="32"
              height="33"
              viewBox="0 0 32 33"
              fill="none"
            >
              <circle cx="16.1886" cy="16.6948" r="15.7492" fill={checkFill} />
              <path
                d="M10.5639 16.4698L14.3887 20.7446L22.7133 12.645"
                stroke="white"
                strokeWidth="2.69986"
              />
            </svg>

                        <svg
              width="225"
              height="160"
              viewBox="0 0 225 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M74.3499 1.61518C116.925 -6.45707 134.575 17.6849 138.078 30.765C143.295 42.3501 136.065 80.2503 137.631 113.057C139.867 159.921 117.282 159.024 107.444 159.921C97.605 160.818 41.4799 154.091 22.6969 139.292C7.67061 127.453 -8.81015 78.4076 5.47931 45.3399C14.1999 25.1592 31.7753 9.68743 74.3499 1.61518Z"
                fill={notebookFill}
              />
              <path
                d="M21.6109 83.1567L20.9714 79.1187C20.2749 74.7216 23.275 70.5924 27.6722 69.8959C32.0119 69.2086 36.1027 72.1232 36.8703 76.4495L37.6107 80.6226"
                stroke="#A59FC9"
                strokeWidth="5.39972"
              />
              <rect
                x="14.4999"
                y="84.283"
                width="30.5984"
                height="28.3486"
                rx="3.59982"
                transform="rotate(-9 14.4999 84.283)"
                fill={lockShackleFill}
              />
              <rect
                x="14.4999"
                y="84.283"
                width="30.5984"
                height="20.249"
                rx="3.59982"
                transform="rotate(-9 14.4999 84.283)"
                fill="#E3488B"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M34.3401 100.243C35.3055 99.4602 35.8385 98.1979 35.63 96.8819C35.319 94.9182 33.475 93.5785 31.5114 93.8895C29.5478 94.2005 28.208 96.0445 28.519 98.0081C28.7275 99.3242 29.6245 100.36 30.7846 100.806L31.2823 103.949C31.4378 104.93 32.3598 105.6 33.3416 105.445C34.3234 105.289 34.9933 104.367 34.8378 103.386L34.3401 100.243Z"
                fill={notebookFill}
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M45.4836 25.9488C42.0049 25.8881 39.1357 28.6589 39.075 32.1376L37.4494 125.269C37.3886 128.747 40.1594 131.617 43.6381 131.677L48.6056 131.764C48.596 131.615 48.5923 131.465 48.595 131.314C48.647 128.332 51.1064 125.957 54.0881 126.009C57.0698 126.061 59.4448 128.521 59.3928 131.502C59.3901 131.654 59.3813 131.804 59.3664 131.952L216.403 134.693C219.882 134.754 222.751 131.983 222.812 128.504L224.437 35.3731C224.498 31.8944 221.727 29.0252 218.248 28.9645L45.4836 25.9488ZM54.9048 79.2187C57.8866 79.2707 60.3459 76.8957 60.398 73.914C60.45 70.9323 58.0751 68.4729 55.0933 68.4209C52.1116 68.3688 49.6522 70.7438 49.6002 73.7255C49.5481 76.7073 51.9231 79.1666 54.9048 79.2187ZM59.8954 102.708C59.8433 105.69 57.384 108.065 54.4022 108.013C51.4205 107.961 49.0455 105.501 49.0976 102.52C49.1496 99.538 51.609 97.163 54.5907 97.215C57.5724 97.2671 59.9474 99.7264 59.8954 102.708Z"
                fill={lockBodyFill}
              />
            </svg>
          </div>

                    <div className="relative mt-10 max-w-[240px]">
            <input
              type={visible ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="pg-placeholder w-full border-0 text-base h-11 pr-[60px] pl-4 pt-[2px]"
              style={{
                background: inputBg,
                borderRadius: inputRadius,
                color: inputColor,
                fontFamily: "sans-serif",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-5 translate-y-[-50%] top-[50%] leading-[14px] cursor-pointer text-xs font-bold border-0 bg-transparent p-0"
              style={{
                color: showHideColor,
                fontFamily: "'Special Elite', cursive",
              }}
            >
              {visible ? hideLabel : showLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
