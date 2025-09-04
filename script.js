const sendText = document.getElementById("searchBtn");
const chatInput = document.getElementById("chatInput");
const searchBtn = document.getElementById("searchBtn");
const dnwBTN = document.getElementById("dnwBTN");
const chatsectionDiv = document.getElementById("chatsection");

let conversationHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

// ✅ Render old chats on reload
conversationHistory.forEach(msg => {
  let div = document.createElement("div");
  div.classList.add(msg.sender === "User" ? "chatTexts" : "aiTexts");
  div.innerHTML = `<p>${msg.text}</p>`;
  chatsectionDiv.appendChild(div);
});

// Handle user send
sendText.addEventListener("click", async () => {
  let userText = chatInput.value.trim();
  if (!userText) return;

  // create user message
  let chatText = document.createElement("div");
  chatText.classList.add("chatTexts");
  chatText.innerHTML = `<p>${userText}</p>`;
  const oldLast = chatsectionDiv.querySelector("#latestMsg");
  if (oldLast) oldLast.removeAttribute("id");
  chatText.id = "latestMsg";
  chatsectionDiv.appendChild(chatText);
  location.replace("#latestMsg");

  // save user msg
  conversationHistory.push({ sender: "User", text: userText });
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));

  chatInput.value = "";

  // ✅ Call Gemini API
  try {
    let response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAj52FLcVsU60wgiGIYIfEn07L0x5Ypbnk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Conversation so far:\n" + conversationHistory.map(m => `${m.sender}: ${m.text}`).join("\n") + `\nAI reply to last user message: ${userText}` }]
          }
        ]
      })
    });

    let data = await response.json();
    let aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ AI couldn’t generate a reply.";

    // create AI message
    let aiText = document.createElement("div");
    aiText.classList.add("aiTexts");
    aiText.innerHTML = `<p>${aiReply.replace(/\n/g, "<br>")}</p>`; // format nicely
    chatsectionDiv.appendChild(aiText);

    // save AI msg
    conversationHistory.push({ sender: "AI", text: aiReply });
    localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));

    aiText.id = "latestMsg";
    location.replace("#latestMsg");

  } catch (err) {
    console.error("API Error:", err);
    let errorText = document.createElement("div");
    errorText.classList.add("aiTexts");
    errorText.innerHTML = `<p>⚠️ Error fetching AI response.</p>`;
    chatsectionDiv.appendChild(errorText);
  }
});

// ✅ Styling (don’t touch as per your request)
chatInput.addEventListener("focus", () => {
  searchBtn.style.borderTopRightRadius = "20px";
  searchBtn.style.borderBottomRightRadius = "20px";
  searchBtn.style.borderTopLeftRadius = "20px";
  searchBtn.style.borderBottomLeftRadius = "20px";
  searchBtn.style.bottom = "-20px";
  searchBtn.style.right = "0";

  dnwBTN.style.bottom = "-20px";
  dnwBTN.style.left = "0";   
});

chatInput.addEventListener("blur", () => {
  searchBtn.style.borderTopRightRadius = "20px";
  searchBtn.style.borderBottomRightRadius = "20px";
  searchBtn.style.borderTopLeftRadius = "0px";
  searchBtn.style.borderBottomLeftRadius = "0px";
  searchBtn.style.bottom = "0";
  searchBtn.style.right = "0";

  dnwBTN.style.bottom = "0";
  dnwBTN.style.left = "0";
});
