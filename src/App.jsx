import { useState } from "react";
import { db } from "./firebase/firebaseSetUp";
import { ref, get, child } from "firebase/database";
import ShortUniqueId from "short-unique-id";
import Typer from "./component/Typer";
function App() {
  const [id, setId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [owner, setOwner] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [noRoom, setNoRoom] = useState(false);
  const [sameName, setSameName] = useState(false);

  if (hasAccess) {
    return <Typer id={id} roomId={roomId} owner={owner} />;
  }
  return (
    <main className="h-screen w-full bg-cover bg-no-repeat bg-center bg-[url('src//assets/lower.jpg')] grid items-center justify-center ">
      {!hasAccess && (
        <form
          className="flex flex-col gap-4 "
          onSubmit={(e) => {
            e.preventDefault();
            if (!owner) {
              get(
                child(
                  ref(db),
                  "/Rooms_" +
                    new Date().toISOString().split("T")[0] +
                    "/" +
                    roomId
                )
              ).then((snap) => {
                if (snap.exists()) {
                  if (snap.val()[id]) {
                    setSameName(true);
                  } else {
                    setHasAccess(true);
                  }
                } else {
                  setNoRoom(true);
                }
              });
            } else {
              setHasAccess(true);
            }
          }}
        >
          <div
            className={` flex flex-col gap-1 items-center ${
              sameName ? "upper-red" : ""
            } `}
          >
            <input
              type="text"
              autoFocus
              required
              value={id}
              className="user_input"
              placeholder="User Id"
              onChange={(e) => {
                setId(e.target.value);
              }}
            />
          </div>

          <div
            className={` flex flex-col gap-1 items-center ${
              noRoom ? "red" : ""
            } `}
          >
            <input
              type="text"
              value={roomId}
              required
              className="user_input"
              placeholder="Join a room"
              style={{
                borderColor: noRoom ? "red" : "grey",
              }}
              onChange={(e) => {
                if (!owner) {
                  setRoomId(e.target.value);
                }
              }}
            />
          </div>

          {/* {noRoom && <p className="text-red-400">No Room with that ID</p>} */}

          <input
            className="user_input cursor-pointer rounded border-[1px] "
            onClick={() => {
              const uid = new ShortUniqueId({ length: 5 });
              setRoomId(uid());
              setOwner(true);
            }}
            type="button"
            value="Or Generate A Room"
          />

          <input
            type="submit"
            className="user_input cursor-pointer rounded border-[1px]"
            value={"Enter Game"}
          />
        </form>
      )}
    </main>
  );
}

export default App;
