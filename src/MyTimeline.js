import React, { useEffect, useState } from 'react';
import { useSwipeable } from "react-swipeable";

export default function MyTimeline({
    myList,
    darkMode,
    lineColor,
    amountMove,
    labelWidth,
    eventTextAlignCenter,
    showSlider
}) {
    const [positionLeft, setpositionLeft] = useState(0);
    const [positionAllowed, setpositionAllowed] = useState(0);
    const [rightBtnEnable, setrightBtnEnable] = useState(true);
    const [prevIdx, setprevIdx] = useState(-1);
    const [rightToLeft, setrightToLeft] = useState(null);
    const [curStatus, setcurStatus] = useState(myList && Object.values(myList[0])[0]);
    const [curIdx, setcurIdx] = useState(0);

    const checkIfNeedToDisableRightButton = (leftPosition) => {
        if ((leftPosition * -1) >= positionAllowed) {//chack if its my last time i can click on right arrow, if yes, this loop shoud disable right arrow btn
            setpositionLeft(-positionAllowed);//set the maximum position that i can give to the axis
            setrightBtnEnable(false);//disable right arrow
            return true;
        } else {// i still can click on right arrow btn
            setrightBtnEnable(true);
            return false;
        }
    };

    const moveAxis = (direction, amount) => {
        let leftPosition;

        if (direction === "right") {
            leftPosition = positionLeft - amount; // calculate my left position after click arrow
            let isNeedDisable = checkIfNeedToDisableRightButton(leftPosition);//check if i need to disable my right arrow
            if (isNeedDisable) { return; }

        } else {
            leftPosition = positionLeft + amount;
            setrightBtnEnable(true);// after i clicked on left arrow, right arrow should be enabled for sure
            if (leftPosition > 0) {// check if its my last click on left arrow
                setpositionLeft(0);
                return;
            }
        }
        setpositionLeft(leftPosition);
    };

    const resizeListener = () => {
        window.addEventListener("resize", calcAfterResize);
    };

    const calcAfterResize = () => {
        calcPostionSlideLeft();
    };

    useEffect(() => {
        calcPostionSlideLeft();
        resizeListener();
        return () => {
            window.removeEventListener("resize", calcAfterResize);
        };
    }, [positionLeft]);

    const calcPostionSlideLeft = () => {//calculate how many px i can move my axis
        let positionAllowed = document.getElementById("myAxis").getClientRects()[0].width - document.getElementById("axisWrapper").getClientRects()[0].width;
        setpositionAllowed(positionAllowed);
    };

    const handlers = useSwipeable({
        onSwiped: (eventData) => {
            if (eventData.deltaX < 0) {
                moveAxis('right', eventData.deltaX * -1);
            } else {
                moveAxis('left', eventData.deltaX);
            }
        }
    });

    return (
        <div className="wrapperAll">
            {positionLeft === 0 ? <i class="fas fa-chevron-circle-left disabledBtn fa-2x"
                aria-setsize={12}
                id="leftArrow"
                style={{
                    color: "grey",
                    borderColor: "grey"
                }}

            ></i> : <i 
                class="fas fa-chevron-circle-left enableBtn fa-2x"
                id="leftArrow"
                onClick={() => moveAxis('left', amountMove)}
                style={{
                    color: lineColor,
                    borderColor: lineColor
                }}
            ></i>
            }
            <div
                className="axisWrapper"
                id="axisWrapper"
                {...handlers}
            >
                <div
                    className={`axis ${positionAllowed < 0 ? "notEnoghEvents" : ""}`}
                    id="myAxis"
                    style={{
                        left: `${positionLeft}px`,
                        borderTop: `2px solid ${lineColor}`,
                    }}
                >
                    {myList && myList.map((val, index) => {

                        return <div
                            className="specificEvent"
                            id="specificEvent"
                            style={{
                                width: `${labelWidth}px`,
                                color: `${darkMode ? "#fff" : "unset"}`,
                                textAlign: `${eventTextAlignCenter ? "center" : "unset"}`
                            }}
                            key={index}
                            onClick={() => {
                                setcurIdx(index);
                                setcurStatus('');
                                setrightToLeft(index === curIdx ? null : (index > curIdx ? true : false));
                                setTimeout(() => {
                                    setprevIdx(curIdx);
                                    setcurStatus(myList[index].details1);
                                }, 0);
                            }}
                        >
                            <div
                                className="dot"
                                style={{
                                    left: `${labelWidth / 2}px`,
                                    background: lineColor
                                }}
                            ></div>

                            {Object.values(val).map((value, index) => {
                                return <div key={index} className="descriptionEventDetails">{value}</div>;
                            })}
                        </div>;
                    })}
                </div>
            </div>
            {
                positionAllowed > 0 && rightBtnEnable ? <i 
                    class="fas fa-chevron-circle-right enableBtn fa-2x"
                    onClick={() => moveAxis('right', amountMove)}
                    style={{
                        color: lineColor,
                        borderColor: lineColor
                    }}
                ></i> :
                    <i 
                        class="fas fa-chevron-circle-right disabledBtn fa-2x"
                        style={{
                            color: "grey",
                            borderColor: "grey"
                        }}
                    ></i>

            }

            {
                showSlider && <div className="wrapperEventCurrent">
                    {
                        curStatus && <span
                            className="currentEventToShow"
                            style={{ animationName: `${rightToLeft === null ? "top-to-bottom" : (rightToLeft ? "right-to-left" : "left-to-right")}` }}>
                            {curStatus}
                        </span>
                    }
                </div>
            }
        </div>
    );
}
