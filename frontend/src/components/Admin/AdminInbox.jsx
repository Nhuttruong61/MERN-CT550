import React, { useEffect, useState } from "react";
import * as ConvertionService from "../../service/conventionService";
import * as MessageService from "../../service/messageService";
import * as UserService from "../../service/userService";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import socketIO from "socket.io-client";
import * as timeago from "timeago.js";
import { UserOutlined } from "@ant-design/icons";
const ENDPOINT = "http://localhost:8000/";
const socketId = socketIO(ENDPOINT, {
  transport: ["websocket"],
  withCredentials: true,
});

function AdminInbox() {
  const { account } = useSelector((state) => state.user);
  const [convertion, setConvertion] = useState([]);
  const [openMessage, setOpenMessage] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [listUser, setListUser] = useState([]);
  const getConvertion = async () => {
    const data = await ConvertionService.getAllConversations(account._id);
    if (data?.success) {
      setConvertion(data.conversations);
    }
  };
  useEffect(() => {
    getConvertion();
  }, []);

  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createAt: data.now,
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  // create message
  const createMessageHandler = async () => {
    const message = {
      sender: account._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member._id === account._id
    );
    socketId.emit("sendMessage", {
      senderId: account._id,
      receiverId,
      text: newMessage,
    });
    try {
      if (newMessage !== "") {
        await MessageService.createMessage(message)
          .then((res) => {
            setMessages([...messages, res.message]);
            updateLastMessage();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  //get message
  const getMessage = async () => {
    if (currentChat) {
      const res = await MessageService.getAllMessage(currentChat?._id);
      if (res.success) {
        setMessages(res.message);
      }
    }
  };
  useEffect(() => {
    getMessage();
  }, [currentChat]);

  //update last message
  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: account._id,
    });
    const data = {
      lastMessage: newMessage,
      lastMessageId: account._id,
    };
    await MessageService.UpdateMessage(currentChat._id, data);
  };
  return (
    <div className="w-[90%] bg-white h-[80vh] m-5  overflow-y-scroll rounded">
      {!openMessage ? (
        <>
          <h1 className="font-[600] text-[24px]">Tất cả tin nhắn</h1>
          {convertion?.map((item, index) => {
            return (
              <ListMessage
                data={item}
                key={index}
                setOpenMessage={setOpenMessage}
                createMessageHandler={createMessageHandler}
                setCurrentChat={setCurrentChat}
                me={account._id}
                setListUser={setListUser}
                listUser={listUser}
              />
            );
          })}
        </>
      ) : (
        <>
          <SeleteInbox
            setOpenMessage={setOpenMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            createMessageHandler={createMessageHandler}
            messages={messages}
            sellerId={account._id}
            listUser={listUser}
          />
        </>
      )}
    </div>
  );
}
const ListMessage = ({
  data,
  setOpenMessage,
  setCurrentChat,
  me,
  setListUser,
  listUser,
}) => {
  const navigate = useNavigate();
  const handleClickConvertion = (id) => {
    navigate(`/system/admin?${id}`);
    setOpenMessage(true);
  };

  useEffect(() => {
    const userId = data.members.find((user) => user !== me);
    const getUser = async () => {
      try {
        const res = await UserService.getUserById(userId);
        if (res.success) {
          setListUser(res.user);
        }
      } catch (e) {
        console.log(e);
      }
    };

    getUser();
  }, [me, data]);
  return (
    <div
      className="w-full flex p-2 my-2 px-3 hover:bg-[#f2f2f2] cursor-pointer"
      onClick={() => handleClickConvertion(data._id) || setCurrentChat(data)}
    >
      {listUser?.avatar ? (
        <img
          src={listUser?.avatar.url}
          alt=""
          className="w-[50px] h-[50px] object-cover rounded-full"
        />
      ) : (
        <UserOutlined className="text-[24px] p-2" />
      )}
      <div className="pl-3">
        <h1 className="font-[500]">{listUser.name}</h1>
        {data?.lastMessage && (
          <p className="text-[12px]"> {data?.lastMessage}</p>
        )}
      </div>
    </div>
  );
};

const SeleteInbox = ({
  setOpenMessage,
  newMessage,
  setNewMessage,
  createMessageHandler,
  messages,
  sellerId,
  listUser,
}) => {
  const handleExit = () => {
    setOpenMessage(false);
  };
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      <div className="flex shadow">
        <div className="w-full flex m-2">
          {listUser?.avatar ? (
            <img
              src={listUser?.avatar.url}
              alt=""
              className="w-[50px] h-[50px] object-cover rounded-full"
            />
          ) : (
            <UserOutlined className="text-[24px] p-2" />
          )}
          <div className="px-2">
            <h1 className="font-[600]">{listUser?.name}</h1>
          </div>
        </div>
        <AiOutlineClose
          className="text-[24px] hover:bg-red-600 hover:text-white"
          onClick={handleExit}
        />
      </div>
      <div className="px-3 h-[60vh]  overflow-y-scroll py-2">
        {messages?.map((item, index) => {
          return (
            <div
              key={index}
              className={`w-full flex my-2 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              } `}
            >
              {item.sender !== sellerId && (
                <img
                  src={listUser.avatar.url}
                  alt=""
                  className="w-[30px] h-[30px] rounded-full mr-2"
                />
              )}
              <div className="flex flex-col">
                <div
                  className={`w-max px-2 py-1 rounded-[8px] ${
                    item.sender !== sellerId
                      ? "bg-[#ccc] text-black"
                      : "bg-[#0866ff] text-white"
                  }`}
                >
                  <p>{item.text}</p>
                </div>
                <p className="text-[10px]">{timeago.format(item.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="w-[5%] flex justify-center items-center cursor-pointer">
          <input
            type="file"
            name=""
            id="image"
            className="hidden"
            // onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <BsImages className="text-[24px] text-[#5b5b5b]" />
          </label>
        </div>
        <input
          type="text"
          value={newMessage}
          className="w-[90%] px-2 h-auto my-1 py-2 border-[2px] rounded-[8px] outline-none"
          placeholder="Aa"
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="cursor-pointer w-[5%]"
          disabled={newMessage.trim() === ""}
          onClick={createMessageHandler}
        >
          <AiOutlineSend className="text-[24px] mx-2" />
        </button>
      </div>
    </div>
  );
};

export default AdminInbox;
