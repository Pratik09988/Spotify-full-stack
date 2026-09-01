import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../App";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTrash, faEnvelope, faBan, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

const ListUser = () => {
  const [data, setData] = useState([]);
  const [blockUser, setBlockUser] = useState(null);
  const [messageUser, setMessageUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/user/list`);
      if (response.data.success) {
        setData(response.data.users || []);
      } else {
        toast.error(response.data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.log("FETCH USERS ERROR:", error);
      toast.error(error.response?.data?.message || "Error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRemoveUser = async (user) => {
    const confirmRemove = window.confirm(`Are you sure you want to remove "${user.name}"?`);
    if (!confirmRemove) return;
    try {
      const response = await axios.delete(`${url}/api/user/delete/${user._id}`);
      if (response.data.success) {
        toast.success("User removed successfully");
        setData((prev) => prev.filter((item) => item._id !== user._id));
      } else {
        toast.error(response.data.message || "Failed to remove user");
      }
    } catch (error) {
      console.log("REMOVE USER ERROR:", error);
      toast.error("Unable to remove user");
    }
  };

  const handleBlockUser = async (duration) => {
    if (!blockUser) return;
    try {
      const response = await axios.post(`${url}/api/user/block`, {
        userId: blockUser._id,
        duration,
      });
      if (response.data.success) {
        toast.success(duration === "permanent" ? `${blockUser.name} blocked permanently` : `${blockUser.name} blocked for ${duration} days`);
        setData((prev) => prev.map((item) => {
          if (item._id === blockUser._id) {
            return {
              ...item,
              isBlocked: true,
              blockedUntil: response.data.blockedUntil || null,
              blockDuration: response.data.blockDuration || (duration === "permanent" ? "permanent" : `${duration} days`),
            };
          }
          return item;
        }));
        setBlockUser(null);
      } else {
        toast.error(response.data.message || "Failed to block user");
      }
    } catch (error) {
      console.log("BLOCK USER ERROR:", error);
      toast.error("Unable to block user");
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      const response = await axios.post(`${url}/api/user/unblock`, {
        userId: user._id,
      });
      if (response.data.success) {
        toast.success(`${user.name} unblocked successfully`);
        setData((prev) => prev.map((item) => {
          if (item._id === user._id) {
            return {
              ...item,
              isBlocked: false,
              blockedUntil: null,
              blockDuration: null,
            };
          }
          return item;
        }));
      } else {
        toast.error(response.data.message || "Failed to unblock user");
      }
    } catch (error) {
      console.log("UNBLOCK USER ERROR:", error);
      toast.error("Unable to unblock user");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (!messageUser?._id) {
      toast.error("User not selected");
      return;
    }
    try {
      setMessageLoading(true);
      const response = await axios.post(`${url}/api/message/send`, {
        userId: messageUser._id,
        message: message.trim(),
      });
      if (response.data.success) {
        toast.success("Message sent successfully");
        setMessage("");
        setMessageUser(null);
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.log("SEND MESSAGE ERROR:", error);
      toast.error(error.response?.data?.message || "Unable to send message");
    } finally {
      setMessageLoading(false);
    }
  };

  const UserActions = ({ item }) => (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => handleRemoveUser(item)} title="Remove User" className="w-9 h-9 rounded-lg flex items-center justify-center border border-red-200 text-red-600 hover:bg-red-50 transition">
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <button type="button" onClick={() => { setMessageUser(item); setMessage(""); }} title="Send Message" className="w-9 h-9 rounded-lg flex items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
        <FontAwesomeIcon icon={faEnvelope} />
      </button>
      {item.isBlocked ? (
        <button type="button" onClick={() => handleUnblockUser(item)} title="Unblock User" className="w-9 h-9 rounded-lg flex items-center justify-center border border-green-200 text-green-600 hover:bg-green-50 transition">
          <FontAwesomeIcon icon={faCheck} />
        </button>
      ) : (
        <button type="button" onClick={() => setBlockUser(item)} title="Block User" className="w-9 h-9 rounded-lg flex items-center justify-center border border-orange-200 text-orange-600 hover:bg-orange-50 transition">
          <FontAwesomeIcon icon={faBan} />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="w-10 h-10 border-4 border-[#C8C1B2] border-t-[#2F6B4F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <h2 className="text-lg sm:text-xl font-semibold text-center text-[#173C27] mb-4">All Users List</h2>
      {data.length === 0 ? (
        <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-xl p-8 text-center text-[#6B756E]">No users found</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-[#FFFDF7] rounded-xl border border-[#D9DED6] shadow-sm">
            <div className="min-w-[750px] flex items-center px-4 py-4 bg-[#DCECDD] text-[#173C27] text-sm font-semibold">
              <div className="flex-1 text-center">User</div>
              <div className="w-[190px] text-center">Actions</div>
            </div>
            {data.map((item, index) => (
              <div key={item._id || index} className="min-w-[750px] flex items-center gap-3 px-4 py-4 border-t border-[#E1E5DF] hover:bg-[#F5F8F1] transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faUser} className="text-[#0B5A35]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#274433] truncate">{item.name || "No name"}</p>
                    <p className="text-xs text-[#68766E] truncate">Email: {item.email || "No email"}</p>
                    <p className="text-xs text-[#68766E] truncate">Mobile: {item.mobile || "No mobile"}</p>
                    <p className="text-xs text-[#68766E] capitalize">Gender: {item.gender || "Not specified"}</p>
                    {item.isBlocked && (
                      <p className="text-xs font-semibold text-red-600 mt-1">
                        {item.blockDuration === "permanent" ? "Permanently Blocked" : `Blocked for ${item.blockDuration || "temporary period"}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-[190px] flex justify-center">
                  <UserActions item={item} />
                </div>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {data.map((item, index) => (
              <div key={item._id || index} className="bg-[#FFFDF7] border border-[#D9DED6] rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faUser} className="text-[#0B5A35]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#274433] truncate">{item.name || "No name"}</p>
                    <p className="text-xs text-[#68766E] truncate mt-1">{item.email || "No email"}</p>
                    <p className="text-xs text-[#68766E] truncate mt-1">{item.mobile || "No mobile"}</p>
                    <p className="text-xs text-[#68766E] capitalize mt-1">{item.gender || "Not specified"}</p>
                    {item.isBlocked && (
                      <div className="inline-flex mt-2 px-2 py-1 rounded-full bg-red-50 border border-red-200">
                        <span className="text-[10px] font-semibold text-red-600">{item.blockDuration === "permanent" ? "Permanently Blocked" : `Blocked for ${item.blockDuration || "temporary period"}`}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-3 border-t border-[#E5E8E3]">
                  <UserActions item={item} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {blockUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-5">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#FFFDF7] rounded-2xl shadow-2xl border border-[#D9DED6] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-[#173C27]">Block User</h3>
                <p className="text-xs text-[#68766E] mt-1 truncate">{blockUser.name}</p>
              </div>
              <button type="button" onClick={() => setBlockUser(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5EF] shrink-0">
                <FontAwesomeIcon icon={faXmark} className="text-[#68766E]" />
              </button>
            </div>
            <div className="space-y-2">
              <button type="button" onClick={() => handleBlockUser(7)} className="w-full text-left px-4 py-3 rounded-lg border border-[#D9DED6] hover:bg-[#F1F5EF] transition">
                <p className="font-semibold text-sm text-[#274433]">Block for 7 Days</p>
                <p className="text-xs text-[#68766E] mt-1">User will automatically be unblocked after 7 days.</p>
              </button>
              <button type="button" onClick={() => handleBlockUser(30)} className="w-full text-left px-4 py-3 rounded-lg border border-[#D9DED6] hover:bg-[#F1F5EF] transition">
                <p className="font-semibold text-sm text-[#274433]">Block for 30 Days</p>
                <p className="text-xs text-[#68766E] mt-1">User will automatically be unblocked after 30 days.</p>
              </button>
              <button type="button" onClick={() => handleBlockUser("permanent")} className="w-full text-left px-4 py-3 rounded-lg border border-red-200 hover:bg-red-50 transition">
                <p className="font-semibold text-sm text-red-600">Block Permanently</p>
                <p className="text-xs text-[#68766E] mt-1">User will remain blocked until manually unblocked.</p>
              </button>
            </div>
            <button type="button" onClick={() => setBlockUser(null)} className="w-full mt-4 px-4 py-2.5 rounded-lg border border-[#CCD4CC] text-sm hover:bg-[#F1F5EF]">Cancel</button>
          </div>
        </div>
      )}
      {messageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-5">
          <div className="w-full max-w-md bg-[#FFFDF7] rounded-2xl shadow-2xl border border-[#D9DED6] p-4 sm:p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-[#173C27]">Send Message</h3>
                <p className="text-xs text-[#68766E] mt-1 truncate">To: {messageUser.name}</p>
                <p className="text-xs text-[#68766E] truncate">{messageUser.email}</p>
              </div>
              <button type="button" onClick={() => { setMessageUser(null); setMessage(""); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5EF] shrink-0">
                <FontAwesomeIcon icon={faXmark} className="text-[#68766E]" />
              </button>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." rows={5} disabled={messageLoading} className="w-full resize-none rounded-lg border border-[#CCD4CC] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B5A35] disabled:opacity-60" />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
              <button type="button" disabled={messageLoading} onClick={() => { setMessageUser(null); setMessage(""); }} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#CCD4CC] text-sm hover:bg-[#F1F5EF] disabled:opacity-50">Cancel</button>
              <button type="button" disabled={messageLoading} onClick={handleSendMessage} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0B5A35] text-white text-sm hover:bg-[#08472A] transition disabled:opacity-50">{messageLoading ? "Sending..." : "Send Message"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUser;