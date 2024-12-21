"use client";
import React from "react";

function MainComponent() {
  const [testMode, setTestMode] = useState(false);
  const [newFriend, setNewFriend] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [drinkPref, setDrinkPref] = useState("");
  const [friends, setFriends] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showBarView, setShowBarView] = useState(false);
  const [showRoundHistory, setShowRoundHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null);
  const [customDrink, setCustomDrink] = useState("");
  const [showCustomDrinkPopup, setShowCustomDrinkPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [showEditUserPopup, setShowEditUserPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const currentRound =
    friends.length > 0
      ? {
          drinks: friends
            .map((f) => ({ drink: f.drink }))
            .filter((d) => d.drink !== "None"),
        }
      : null;
  const drinkCounts =
    currentRound?.drinks.reduce((acc, { drink }) => {
      if (drink !== "None") {
        acc[drink] = (acc[drink] || 0) + 1;
      }
      return acc;
    }, {}) || {};
  const [messageStatus, setMessageStatus] = useState(null);

  useEffect(() => {
    if (shareStatus) {
      const timer = setTimeout(() => {
        setShareStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shareStatus]);

  useEffect(() => {
    if (messageStatus) {
      const timer = setTimeout(() => {
        setMessageStatus(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messageStatus]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/add-sample-data", {
          method: "POST",
        });
        const data = await response.json();
        const newFriends = data.friends.map((f) => ({
          name: f.name,
          mobile: f.mobile || "",
          email: f.email || "",
          drink: f.preference || "",
        }));
        setFriends(newFriends);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    const savedFriends = localStorage.getItem("friends");
    const savedRounds = localStorage.getItem("rounds");
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    } else {
      loadInitialData();
    }
    if (savedRounds) setRounds(JSON.parse(savedRounds));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("friends", JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem("rounds", JSON.stringify(rounds));
  }, [rounds]);

  const loadSampleData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/add-sample-data", {
        method: "POST",
      });
      const data = await response.json();
      const newFriends = data.friends.map((f) => ({
        name: f.name,
        mobile: "",
        email: "",
        drink: f.preference,
      }));
      setFriends(newFriends);
      localStorage.setItem("friends", JSON.stringify(newFriends));
      setRounds([]);
      localStorage.setItem("rounds", JSON.stringify([]));
      setShowAdmin(false);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  const addFriend = async () => {
    if (newFriend && drinkPref) {
      const friend = {
        name: newFriend,
        mobile: mobileNumber,
        email: emailAddress,
        drink: drinkPref,
      };
      try {
        const response = await fetch("/api/add-friend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            friendName: friend.name,
            email: friend.email,
            mobile: friend.mobile,
            drinkPreference: friend.drink,
          }),
        });
        if (response.ok) {
          const newFriends = [...friends, friend];
          setFriends(newFriends);
          localStorage.setItem("friends", JSON.stringify(newFriends));
          setNewFriend("");
          setMobileNumber("");
          setEmailAddress("");
          setDrinkPref("");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  const removeFriend = (index) => {
    const newFriends = friends.filter((_, i) => i !== index);
    setFriends(newFriends);
    localStorage.setItem("friends", JSON.stringify(newFriends));
  };
  const markRound = () => {
    if (friends.length > 0) {
      const buyer = friends[currentTurn];
      const newRounds = [
        ...rounds,
        {
          buyer: buyer.name,
          time: new Date(),
          drinks: friends.map((f) => ({
            drinker: f.name,
            drink: f.drink,
          })),
        },
      ];
      setRounds(newRounds);
      localStorage.setItem("rounds", JSON.stringify(newRounds));
      setCurrentTurn((currentTurn + 1) % friends.length);
    }
  };
  const updateDrink = (friendName, newDrink) => {
    if (newDrink === "custom") {
      setEditingDrink(friendName);
      setShowCustomDrinkPopup(true);
    } else {
      const newFriends = friends.map((f) =>
        f.name === friendName ? { ...f, drink: newDrink } : f
      );
      setFriends(newFriends);
      localStorage.setItem("friends", JSON.stringify(newFriends));
      setEditingDrink(null);
    }
  };
  const confirmCustomDrink = () => {
    if (customDrink && editingDrink) {
      const newFriends = friends.map((f) =>
        f.name === editingDrink ? { ...f, drink: customDrink } : f
      );
      setFriends(newFriends);
      localStorage.setItem("friends", JSON.stringify(newFriends));
      setEditingDrink(null);
      setCustomDrink("");
      setShowCustomDrinkPopup(false);
    }
  };
  const closeBarView = () => {
    markRound();
    setShowBarView(false);
    setShowOrder(false);
  };
  const clearHistory = () => {
    setShowDeletePopup(true);
  };
  const confirmDelete = () => {
    const selectedUserNames = Object.entries(selectedUsers)
      .filter(([_, isSelected]) => isSelected)
      .map(([name]) => name);

    let newRounds;
    if (selectedUserNames.length === friends.length) {
      newRounds = [];
    } else {
      newRounds = rounds.filter(
        (round) =>
          !selectedUserNames.includes(round.buyer) &&
          !round.drinks.some((drink) =>
            selectedUserNames.includes(drink.drinker)
          )
      );
    }
    setRounds(newRounds);
    localStorage.setItem("rounds", JSON.stringify(newRounds));
    setShowDeletePopup(false);
    setSelectedUsers({});
  };
  const shareOrder = () => {
    setShowSharePopup(true);
  };
  const handleShare = (platform) => {
    const orderText =
      "Get the drinks in!\n\n" +
      friends.map((f) => `${f.name}: ${f.drink}`).join("\n") +
      "\n\nDownload the round tracker app, and save it to your home screen. Get the party started!";
    try {
      switch (platform) {
        case "whatsapp":
          window.open(`https://wa.me/?text=${encodeURIComponent(orderText)}`);
          setShareStatus("success");
          break;
        case "email":
          window.open(`mailto:?body=${encodeURIComponent(orderText)}`);
          break;
        case "copy":
          navigator.clipboard.writeText(orderText);
          break;
      }
    } catch (error) {
      setShareStatus("error");
    }
    setShowSharePopup(false);
  };
  const selectAllUsers = () => {
    const allSelected = friends.reduce((acc, friend) => {
      acc[friend.name] = true;
      return acc;
    }, {});
    setSelectedUsers(allSelected);
  };
  const updateUser = (updatedUser) => {
    const newFriends = friends.map((f) =>
      f.name === editingUser.name ? { ...f, ...updatedUser } : f
    );
    setFriends(newFriends);
    localStorage.setItem("friends", JSON.stringify(newFriends));
    setEditingUser(null);
    setShowEditUserPopup(false);
  };
  const sendWhatsAppMessage = (mobile) => {
    if (!mobile) {
      setMessageStatus("error");
      return;
    }
    try {
      const formattedMobile = mobile.replace(/[^0-9]/g, "");
      window.open(
        `https://wa.me/${formattedMobile}?text=${encodeURIComponent(
          "Download the round tracker app, and save it to your home screen. Get the party started!"
        )}`
      );
      setMessageStatus("success");
    } catch (error) {
      setMessageStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] to-[#3498db] p-2 md:p-6 overflow-y-auto">
      {shareStatus && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg text-white ${
            shareStatus === "success" ? "bg-green-500" : "bg-red-500"
          } transition-opacity duration-500`}
        >
          {shareStatus === "success" ? "✓ Message sent!" : "✕ Message not sent"}
        </div>
      )}
      {messageStatus && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg text-white ${
            messageStatus === "success" ? "bg-green-500" : "bg-red-500"
          } transition-opacity duration-500`}
        >
          {messageStatus === "success" ? "✓" : "✕"}
        </div>
      )}
      {showRoundHistory ? (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2c3e50] to-[#3498db] z-50 p-6">
          <div className="max-w-sm mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📜 Round History</h2>
              <button
                onClick={() => setShowRoundHistory(false)}
                className="text-2xl hover:rotate-90 transition-transform"
              >
                ×
              </button>
            </div>
            {rounds.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-gray-500">No rounds recorded yet</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
                  {friends.map((friend) => {
                    const totalSpent = rounds.reduce(
                      (total, round) =>
                        round.buyer === friend.name ? total + 25 : total,
                      0
                    );
                    return (
                      <div
                        key={friend.name}
                        className="flex justify-between items-center py-1"
                      >
                        <span>{friend.name}</span>
                        <span className="font-medium">
                          £{totalSpent.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <ul className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {rounds.map((round, index) => (
                    <li key={index} className="bg-white/50 rounded-lg p-4">
                      <div className="font-bold mb-2">
                        <div className="flex items-center justify-between">
                          <span>🎯 Buyer: {round.buyer}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const friend = friends.find(
                                (f) => f.name === round.buyer
                              );
                              if (friend?.mobile) {
                                sendWhatsAppMessage(friend.mobile);
                              }
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <i className="fas fa-bullseye"></i>
                          </button>
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(round.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {round.drinks.map((item, i) => (
                          <li key={i} className="text-sm">
                            👤 {item.drinker}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : showBarView ? (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2c3e50] to-[#3498db] z-50 p-6">
          <div className="max-w-sm mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🍺 Bar Orders</h2>
              <button
                onClick={() => {
                  setShowBarView(false);
                  setShowOrder(false);
                }}
                className="text-2xl hover:rotate-90 transition-transform"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {currentRound && currentRound.drinks.length > 0 ? (
                <ul className="space-y-4 h-full overflow-y-auto pr-2">
                  {Object.entries(drinkCounts).map(([drink, count]) => (
                    <li
                      key={drink}
                      className="flex justify-between items-center p-3 bg-white/50 rounded-lg"
                    >
                      <span>🍺 {drink}</span>
                      <span className="font-bold">×{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No drinks ordered</p>
                </div>
              )}
            </div>
            <button
              onClick={closeBarView}
              className="w-full mt-6 bg-gradient-to-r from-[#28a745] to-[#218838] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              ✅ Complete Order
            </button>
          </div>
        </div>
      ) : showOrder ? (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2c3e50] to-[#3498db] z-50 p-6">
          <div className="max-w-sm mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🎯 Current Order</h2>
              <button
                onClick={() => setShowOrder(false)}
                className="text-2xl hover:rotate-90 transition-transform"
              >
                ×
              </button>
            </div>
            <ul className="space-y-4 text-xl flex-1 overflow-y-auto">
              {friends.map((friend, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-white/50 transition-colors rounded-lg"
                >
                  <span className="text-gray-600">👤 {friend.name}</span>
                  {editingDrink === friend.name ? (
                    <div className="flex flex-col gap-2">
                      <select
                        value={
                          friend.drink === "custom" ? "custom" : friend.drink
                        }
                        onChange={(e) => {
                          updateDrink(friend.name, e.target.value);
                        }}
                        className="p-2 rounded-lg bg-white/50 outline-none"
                        autoFocus
                      >
                        <option value="None">None</option>
                        <option value="IPA">IPA</option>
                        <option value="Pilsner">Pilsner</option>
                        <option value="Stout">Stout</option>
                        <option value="Pale Ale">Pale Ale</option>
                        <option value="Sour">Sour</option>
                        <option value="Belgian">Belgian</option>
                        <option value="custom">Custom drink...</option>
                      </select>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingDrink(friend.name)}
                      className="font-medium hover:opacity-70 transition-opacity"
                    >
                      🍺 {friend.drink || "None"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowBarView(true)}
              disabled={friends.length === 0}
              className="w-full mt-6 bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              🍺 Bar View
            </button>
            {showCustomDrinkPopup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Enter Custom Drink</h3>
                  <input
                    type="text"
                    value={customDrink}
                    onChange={(e) => setCustomDrink(e.target.value)}
                    placeholder="Enter drink name"
                    className="w-full p-2 border rounded-lg mb-4"
                    name="customDrink"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={confirmCustomDrink}
                      className="flex-1 bg-[#28a745] text-white px-4 py-2 rounded-lg"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomDrinkPopup(false);
                        setEditingDrink(null);
                        setCustomDrink("");
                      }}
                      className="flex-1 bg-[#dc3545] text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showAdmin ? (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2c3e50] to-[#3498db] z-50 p-2 md:p-6 overflow-y-auto">
          <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-4 md:p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">⚙️ Admin Dashboard</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Test Mode</span>
                  <button
                    onClick={() => setTestMode(!testMode)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      testMode ? "bg-green-500" : "bg-gray-300"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        testMode ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    ></div>
                  </button>
                </div>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="text-2xl hover:rotate-90 transition-transform"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">⚙️ Admin Dashboard</h2>
              <button
                onClick={() => setShowAdmin(false)}
                className="text-2xl hover:rotate-90 transition-transform"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={clearHistory}
                className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-center cursor-pointer"
              >
                <i className="fas fa-trash text-2xl mb-2 text-red-500 pointer-events-none"></i>
                <div className="text-sm pointer-events-none">
                  Delete History
                </div>
              </button>
              <button
                onClick={shareOrder}
                className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-center"
              >
                <i className="fas fa-share-alt text-2xl mb-2 text-blue-500"></i>
                <div className="text-sm">Share Order</div>
              </button>
              <button
                onClick={() => setShowEditUserPopup(true)}
                className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-center"
              >
                <i className="fas fa-edit text-2xl mb-2 text-green-500"></i>
                <div className="text-sm">Edit Users</div>
              </button>
              <button
                onClick={loadSampleData}
                disabled={loading}
                className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-center"
              >
                <i className="fas fa-dice text-2xl mb-2 text-purple-500"></i>
                <div className="text-sm">
                  {loading ? "Loading..." : "Load Sample Data"}
                </div>
              </button>
              <button
                onClick={() => setShowContactPicker(true)}
                className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-center"
              >
                <i className="fab fa-whatsapp text-2xl mb-2 text-[#25D366]"></i>
                <div className="text-sm">Share</div>
              </button>
              <button
                onClick={() => handleShare("email")}
                className="p-6 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-center"
              >
                <i className="fas fa-envelope text-2xl mb-2 text-[#EA4335]"></i>
                <div className="text-sm">Email Share</div>
              </button>
            </div>
            <div className="mt-6">
              <img
                src={`/api/create-qr?text=${encodeURIComponent(
                  "https://drinktrax.created.app"
                )}&size=200&margin=1&format=svg`}
                alt="QR code to open this app on your phone"
                className="w-48 h-48 rounded-lg shadow-lg mx-auto bg-white p-2"
              />
              <p className="text-center mt-4 text-sm text-gray-600">
                Scan to open on your phone, then tap "Add to Home Screen"
              </p>
            </div>
            {showContactPicker && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Share via WhatsApp</h3>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                    name="phoneNumber"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedContact) {
                          sendWhatsAppMessage(selectedContact);
                          setShowContactPicker(false);
                          setSelectedContact(null);
                        }
                      }}
                      className="flex-1 bg-[#25D366] text-white px-4 py-2 rounded-lg"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => {
                        setShowContactPicker(false);
                        setSelectedContact(null);
                      }}
                      className="flex-1 bg-[#6c757d] text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showSharePopup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Share Order</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="p-4 bg-[#25D366] text-white rounded-lg hover:opacity-90"
                    >
                      <i className="fab fa-whatsapp text-2xl"></i>
                    </button>
                    <button
                      onClick={() => handleShare("email")}
                      className="p-4 bg-[#EA4335] text-white rounded-lg hover:opacity-90"
                    >
                      <i className="fas fa-envelope text-2xl"></i>
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="p-4 bg-[#6c757d] text-white rounded-lg hover:opacity-90"
                    >
                      <i className="fas fa-copy text-2xl"></i>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowSharePopup(false)}
                    className="w-full mt-4 bg-[#6c757d] text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {showDeletePopup && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">
                    Select Users to Delete History
                  </h3>
                  <div className="max-h-[40vh] overflow-y-auto mb-4">
                    {friends.map((friend, index) => (
                      <div
                        key={friend.name}
                        className={`flex items-center justify-between p-2 hover:bg-gray-100 rounded ${
                          index % 2 === 0 ? "bg-[#E6F3FF]" : "bg-[#F0F8FF]"
                        }`}
                      >
                        <span>{friend.name}</span>
                        <button
                          onClick={() =>
                            setSelectedUsers((prev) => ({
                              ...prev,
                              [friend.name]: !prev[friend.name],
                            }))
                          }
                          className="text-xl"
                        >
                          {selectedUsers[friend.name] ? (
                            <i className="fas fa-check-circle text-green-500"></i>
                          ) : (
                            <i className="far fa-circle text-gray-400"></i>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-col">
                    <button
                      onClick={selectAllUsers}
                      className="w-full bg-[#6c757d] text-white px-4 py-2 rounded-lg"
                    >
                      Select All
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="w-full bg-[#dc3545] text-white px-4 py-2 rounded-lg"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => {
                        setShowDeletePopup(false);
                        setSelectedUsers({});
                      }}
                      className="w-full bg-[#6c757d] text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {editingUser ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Edit User Details</h3>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="text-2xl hover:rotate-90 transition-transform"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      name="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={editingUser.mobile}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          mobile: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      name="mobile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      name="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Drink Preference
                    </label>
                    <input
                      type="text"
                      value={editingUser.drink}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          drink: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      name="drink"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateUser(editingUser)}
                    className="flex-1 bg-[#28a745] text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-[#dc3545] text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : showEditUserPopup ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Edit Users</h3>
                  <button
                    onClick={() => setShowEditUserPopup(false)}
                    className="text-2xl hover:rotate-90 transition-transform"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto mb-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.name}
                      onClick={() => setEditingUser(friend)}
                      className="flex items-center justify-between p-3 hover:bg-gray-100 rounded cursor-pointer mb-2"
                    >
                      <div>
                        <div className="font-medium">{friend.name}</div>
                        <div className="text-sm text-gray-500">
                          {friend.drink}
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : showFriends ? (
        <div className="fixed inset-0 bg-gradient-to-br from-[#2c3e50] to-[#3498db] z-50 p-6">
          <div className="max-w-sm mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">👥 Add Friend</h2>
              <button
                onClick={() => setShowFriends(false)}
                className="text-2xl hover:rotate-90 transition-transform"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="👤 Friend's name"
                className="w-full p-2 border rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3498db] outline-none transition-all"
                name="friendName"
              />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="📱 Mobile number"
                className="w-full p-2 border rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3498db] outline-none transition-all"
                name="mobileNumber"
              />
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="📧 Email address"
                className="w-full p-2 border rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3498db] outline-none transition-all"
                name="emailAddress"
              />
              <input
                type="text"
                value={drinkPref}
                onChange={(e) => setDrinkPref(e.target.value)}
                placeholder="🍺 Drink preference"
                className="w-full p-2 border rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#3498db] outline-none transition-all"
                name="drinkPreference"
              />
              <button
                onClick={addFriend}
                className="w-full bg-[#28a745] text-white px-4 py-2 rounded-lg hover:bg-[#218838] transition-colors shadow-md"
              >
                Add Friend
              </button>
            </div>
            {!friends.length ? (
              <div className="text-center p-4 md:p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <span className="text-3xl md:text-4xl mb-2 block">👥</span>
                <p className="text-gray-500 italic">
                  Add some friends to get started
                </p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
                {friends.map((friend, index) => (
                  <li
                    key={index}
                    onClick={() => setCurrentTurn(index)}
                    className={`p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center transition-all cursor-pointer hover:bg-[#fff3cd] ${
                      index === currentTurn
                        ? "bg-[#fff3cd] shadow-md scale-105"
                        : "bg-white/50"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                      <span className="font-medium">👤 {friend.name}</span>
                      {index === currentTurn && " 🎯"}
                    </div>
                    {index === currentTurn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFriend(index);
                        }}
                        className="text-red-500 hover:text-red-700 hover:rotate-90 transition-all mt-2 md:mt-0"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-4 md:p-6 border border-white/20 overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex flex-col items-center gap-3 mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold font-roboto bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-transparent bg-clip-text">
                It's your shout!
              </h1>
              <div className="text-xs text-gray-500">Designed by Bri-dog!</div>
              <div className="flex flex-col items-center gap-2">
                <span
                  onClick={() => setShowAdmin(true)}
                  className="text-3xl md:text-4xl animate-bounce hover:scale-110 transition-transform cursor-pointer"
                >
                  🍺
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowFriends(true)}
                className="bg-[#28a745] text-white px-6 py-2 rounded-lg hover:bg-[#218838] transition-colors shadow-md"
              >
                👥 Add Friend
              </button>
            </div>
          </div>
          <div className="mb-6">
            {!friends.length ? (
              <div className="text-center p-4 md:p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <span className="text-3xl md:text-4xl mb-2 block">👥</span>
                <p className="text-gray-500 italic">
                  Add some friends to get started
                </p>
              </div>
            ) : (
              <>
                <div className="bg-[#fff3cd] p-4 rounded-lg mb-4 text-center">
                  <p className="text-lg font-bold">Current Buyer</p>
                  <p className="text-2xl mt-2">
                    🎯 {friends[currentTurn].name}
                  </p>
                </div>
                <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {friends.map((friend, index) => (
                    <li
                      key={index}
                      onClick={() => setCurrentTurn(index)}
                      className={`p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center transition-all cursor-pointer hover:bg-[#fff3cd] ${
                        index === currentTurn
                          ? "bg-[#fff3cd] shadow-md scale-105"
                          : "bg-white/50"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="font-medium">👤 {friend.name}</span>
                        {index === currentTurn && " 🎯"}
                      </div>
                      {index === currentTurn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFriend(index);
                          }}
                          className="text-red-500 hover:text-red-700 hover:rotate-90 transition-all mt-2 md:mt-0"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <button
              onClick={() => markRound()}
              disabled={friends.length === 0}
              className="flex-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              🎯 Next Round
            </button>
            <button
              onClick={() => setShowOrder(true)}
              disabled={friends.length === 0}
              className="flex-1 bg-gradient-to-r from-[#28a745] to-[#218838] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              📱 Show Order
            </button>
            <button
              onClick={() => setShowRoundHistory(true)}
              disabled={rounds.length === 0}
              className="flex-1 bg-gradient-to-r from-[#6c757d] to-[#5a6268] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              📜 History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;