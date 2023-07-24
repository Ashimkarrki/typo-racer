import { useEffect, useState, useRef, useId } from "react";
import { db, fdb } from "../firebase/firebaseSetUp";
import { getDocs, collection, where, query } from "firebase/firestore";
import { set, ref, onValue, update } from "firebase/database";
import finish from "../assets/finish.jpg";
import car from "../assets/car.png";
import carTrack from "../assets/car-track4.jpg";
const Typer = ({ id, roomId, owner }) => {
  const inputId = useId();

  const [, setPosition] = useState("");
  const [isTimerStart, setIsTimerStart] = useState(false);
  const [signal, setSignal] = useState("red");
  const [otherPlayer, setOtherPlayer] = useState([]);
  const [rawOtherPlayerData, setRawOtherPlayerData] = useState([]);
  const refer = useRef();
  const [original, setOriginal] = useState("");
  const [WPM, setWPM] = useState(0);
  const [data, setData] = useState("");
  const [distance, setDistance] = useState(0);
  const [intialTime, setInitialTime] = useState("");
  const changeHandeler = (e) => {
    if (signal === "green") {
      let value = e.target.value;
      if (original[data.length] === value[value.length - 1]) {
        setData(value);
      }
    }
  };

  useEffect(() => {
    refer.current.scrollLeft = 0;
  }, []);

  // for update listening and intially setting
  useEffect(() => {
    if (owner) {
      set(
        ref(
          db,
          "/Rooms_" +
            new Date().toISOString().split("T")[0] +
            "/" +
            roomId +
            "/" +
            "Game Info"
        ),
        {
          start: false,
          reset: false,
          paragraph: Math.floor(Math.random() * 10),
        }
      );
    }
    set(
      ref(
        db,
        "/Rooms_" +
          new Date().toISOString().split("T")[0] +
          "/" +
          roomId +
          "/" +
          id
      ),
      {
        wpm: 0,
        distance: 0,
        id,
        finished: false,
        owner,
      }
    );
    onValue(
      ref(
        db,
        "/Rooms_" + new Date().toISOString().split("T")[0] + "/" + roomId
      ),
      (snapshot) => {
        setRawOtherPlayerData(snapshot.val());
      }
    );
  }, [roomId, id, owner]);
  // for updating distance
  useEffect(() => {
    let half = window.screen.width / 2 - 64;
    const findDistance = (absoluteDistance) => {
      let relativePostion = absoluteDistance - distance;
      if (relativePostion > half || relativePostion < -half) {
        return -1;
      } else {
        return half - relativePostion;
      }
    };
    const formatData = (snapshot) => {
      let temp = [];
      const arr = Object.keys(snapshot);
      temp = arr
        .filter((s) => s !== "Game Info")
        .map((s) => {
          return {
            distance: snapshot[s].distance,
            id: snapshot[s].id,
            wpm: snapshot[s].wpm,
            currentDistance: findDistance(snapshot[s].distance),
            finished: snapshot[s].finished,
            owner: snapshot[s].owner,
          };
        });
      return temp;
    };

    const temp = formatData(rawOtherPlayerData);
    setOtherPlayer(temp);
  }, [rawOtherPlayerData, distance, id]);
  // for WPM
  useEffect(() => {
    if (intialTime) {
      let set;
      if (data.length !== original.length) {
        set = setInterval(() => {
          let time = (new Date() - intialTime) / 1000;
          let wpm = (data.length * 60) / (time * 5);
          setWPM(wpm);
          refer.current.scrollTo({
            behavior: "smooth",
            left: (data.length * 3000) / original.length,
          });
          update(
            ref(
              db,
              "/Rooms_" +
                new Date().toISOString().split("T")[0] +
                "/" +
                roomId +
                "/" +
                id
            ),
            {
              wpm,
              distance: (data.length * 3000) / original.length,
              id,
              finished: false,
              owner,
            }
          );
          setDistance(refer?.current?.scrollLeft);
        }, 100);
      }
      return () => {
        return clearInterval(set);
      };
    }
  }, [intialTime, data, original, roomId, id, owner]);

  /// checking position
  useEffect(() => {
    let count = 1;
    if (original && data.length === original.length) {
      for (let i = 0; i < otherPlayer.length; i++) {
        if (otherPlayer[i].id !== id) {
          if (otherPlayer[i].finished) {
            count = count + 1;
          }
        } else {
          if (otherPlayer[i].finished) {
            return;
          } else {
            update(
              ref(
                db,
                "/Rooms_" +
                  new Date().toISOString().split("T")[0] +
                  "/" +
                  roomId +
                  "/" +
                  id
              ),
              {
                finished: true,
              }
            );
          }
        }
      }
      setPosition(count);
    }
  }, [data, distance, original, id, otherPlayer, roomId]);
  /// for setting timer
  useEffect(() => {
    onValue(
      ref(
        db,
        "/Rooms_" +
          new Date().toISOString().split("T")[0] +
          "/" +
          roomId +
          "/" +
          "Game Info"
      ),
      (snap) => {
        if (snap.val().reset) {
          setDistance(0);
          setWPM(0);
          setData("");
          setSignal("red");
          setIsTimerStart(false);
          setPosition("");
          setInitialTime("");
          refer.current.scrollLeft = 0;
        }
        if (snap.val().start) {
          const time3 = setTimeout(() => {
            setSignal("green");
            setInitialTime(new Date());
          }, 4000);
          const time2 = setTimeout(() => {
            setSignal("yellow");
          }, 2000);
          return () => {
            clearInterval(time3);
            clearTimeout(time2);
          };
        }
      }
    );
  }, [roomId]);
  // for setting original
  useEffect(() => {
    const getData = async (id) => {
      const colRef = query(
        collection(fdb, "Paragraphs"),
        where("id", "==", id)
      );
      const docSnap = await getDocs(colRef);
      docSnap.forEach((doc) => {
        setOriginal(doc.data().item);
      });
    };
    onValue(
      ref(
        db,
        "/Rooms_" +
          new Date().toISOString().split("T")[0] +
          "/" +
          roomId +
          "/Game Info/paragraph"
      ),
      async (snap) => {
        getData(snap.val());
      }
    );
  }, [roomId]);

  function setNewGame() {
    let fields = Object.keys(rawOtherPlayerData).filter(
      (s) => s !== "Game Info"
    );
    let tempObject = {};
    for (let i = 0; i < fields.length; i++) {
      tempObject[fields[i]] = {
        distance: 0,
        finished: false,
        id: fields[i],
        owner: rawOtherPlayerData[fields[i]].owner,
        wpm: 0,
      };
    }
    tempObject["Game Info"] = {
      start: false,
      reset: true,
      paragraph: Math.floor(Math.random() * 10),
    };
    set(
      ref(
        db,
        "/Rooms_" + new Date().toISOString().split("T")[0] + "/" + roomId
      ),
      {
        ...tempObject,
      }
    );
  }
  return (
    <div className=" w-full  min-h-screen">
      <div className="flex absolute z-10  justify-center items-center h-52 w-full">
        <img src={car} alt="car" className="w-32 z-20 absolute" />

        {otherPlayer
          .filter((s) => s.id !== id)
          .map((s) => {
            if (s.currentDistance !== -1) {
              return (
                <div
                  key={s.id}
                  style={{ right: `${s.currentDistance}px` }}
                  className={`w-32 absolute   opacity-50 transition-right `}
                >
                  <p className="absolute left-[1rem] top-[-2rem] z-20 text-red-700">
                    {s.id}
                  </p>
                  <img src={car} alt="a car" />
                </div>
              );
            }
          })}
      </div>
      <div
        ref={refer}
        className=" w-[100vw] relative overflow-x-scroll scrollable "
      >
        <div className=" absolute left-0 top-0 m-1    flex items-center justify-center">
          <div className="flex rounded-md flex-col bg-black p-2  gap-4">
            <div
              style={{
                backgroundColor: signal === "red" ? signal : "white",
              }}
              className="w-7 h-7  rounded-full "
            ></div>{" "}
            <div
              style={{
                backgroundColor: signal === "yellow" ? signal : "white",
              }}
              className="w-7 h-7  rounded-full "
            ></div>{" "}
            <div
              style={{
                backgroundColor: signal === "green" ? signal : "white",
              }}
              className="w-7 h-7  rounded-full "
            ></div>
          </div>
        </div>
        <img
          src={carTrack}
          alt="car track"
          className={`h-52 object-cover max-w-none`}
        />
        <img
          style={{ left: window.screen.width / 2 + 3000 }}
          src={finish}
          className={`absolute  bottom-0 w-[4rem] rotate-90 translate-y-[-70%] skew-y-12 transition-right `}
          alt="finish line"
        />
      </div>
      <div className="my-4">
        <label htmlFor={inputId}>
          <p className="text-xl mx-4 text-center cursor-text">
            <span className="text-black">{data}</span>
            {original[data.length] === " " ? (
              <span className="border-b-2 border-rose-600"> </span>
            ) : (
              <span className="text-rose-500">{original[data.length]}</span>
            )}
            <span className="text-slate-400">
              {original.slice(data.length + 1, original.length)}
            </span>
          </p>
        </label>
        <input
          id={inputId}
          className="flex mt-4 border-2 mx-auto opacity-0 w-0 h-0 select-none"
          type="text"
          value={data}
          onChange={(e) => {
            changeHandeler(e);
          }}
        />
      </div>

      <div className="flex justify-center h-40 overflow-y-scroll  gap-4  ">
        <div className="flex min-w-[12rem] flex-col border p-4 gap-1">
          <h1 className="text-blue-500">Game Info </h1>
          <p>
            Your WPM = <span className="text-rose-400">{Math.floor(WPM)}</span>
          </p>
          <p>
            Room Id = <span className="text-rose-400">{roomId}</span>
          </p>{" "}
          {owner && signal === "green" && (
            <button
              className="border-[1px] border-stone-300 px-2 py-1"
              onClick={setNewGame}
            >
              New Game
            </button>
          )}
          {otherPlayer?.filter((s) => s.id === id)[0]?.owner &&
            signal === "red" && (
              <button
                className="border-[1px] px-2 py-1 border-stone-300"
                onClick={() => {
                  setIsTimerStart(true);
                  update(
                    ref(
                      db,
                      "/Rooms_" +
                        new Date().toISOString().split("T")[0] +
                        "/" +
                        roomId +
                        "/Game Info"
                    ),
                    {
                      start: true,
                    }
                  );
                }}
              >
                Start Timer
              </button>
            )}
        </div>
        <div className="min-w-[12rem] flex flex-col  border p-4 gap-1">
          <h1 className="text-blue-500">Players </h1>
          {otherPlayer.map((s) => {
            return (
              <div key={s.id}>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-xl bg-lime-400"> </div>
                  <div>{s.id}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Typer;
