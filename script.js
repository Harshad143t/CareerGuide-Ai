const sendText = document.getElementById("searchBtn");
const chatInput = document.getElementById("chatInput");

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendText.click();
  }
});

const searchBtn = document.getElementById("searchBtn");
const dnwBTN = document.getElementById("dnwBTN");
const chatsectionDiv = document.getElementById("chatsection");
const clearBTN = document.getElementById("clearBTN");

let selectedSkills = JSON.parse(localStorage.getItem("selectedSkills")) || [];
let conversationHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
let currentTopic = "IT careers"; 

const profanityList = ["badword1", "badword2", "badword3", "ass", "idiot", "stupid", "fuck", "shit", "bitch", "damn", "crap", "piss"]; 

function containsBadWords(text) {
  for (let i = 0; i < profanityList.length; i++) {
    const regex = new RegExp(`\\b${profanityList[i]}\\b`, 'i');
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
}

function removeNewChatSuggestion() {
  const existingSuggestion = document.querySelector('.topic-suggestion');
  if (existingSuggestion) {
    existingSuggestion.remove();
  }
}

function addNewChatSuggestion() {
  removeNewChatSuggestion();
  
 const suggestionDiv = document.createElement('div');
suggestionDiv.className = 'topic-suggestion';
suggestionDiv.innerHTML = `
  <i class="fa-solid fa-lightbulb"></i>
  <span>Want to discuss this topic? Start a <strong>new chat</strong>!</span>
  <button id="quickNewChat" class="quick-new-chat-btn">New Chat</button>
`;
  
  const lastAIMessage = chatsectionDiv.querySelector('.aiTexts:last-of-type');
  if (lastAIMessage) {
    lastAIMessage.parentNode.insertBefore(suggestionDiv, lastAIMessage.nextSibling);
  } else {
    chatsectionDiv.appendChild(suggestionDiv);
  }
  
  const quickNewChatBtn = document.getElementById('quickNewChat');
  if (quickNewChatBtn) {
    quickNewChatBtn.addEventListener('click', () => {
      createNewChat();
      removeNewChatSuggestion();
    });
  }
}

function handleProfanity(userText) {
  let aiText = document.createElement("div");
  aiText.classList.add("aiTexts");
  aiText.innerHTML = `<p>Please refrain from using inappropriate language. This is a professional career advice platform. Thank you.</p>`;
  const oldLastAI = chatsectionDiv.querySelector("#latestMsg");
  if (oldLastAI) oldLastAI.removeAttribute("id");
  aiText.id = "latestMsg";
  chatsectionDiv.appendChild(aiText);

  const aiReply = "Please refrain from using inappropriate language. This is a professional career advice platform. Thank you.";
  conversationHistory.push({ sender: "AI", text: aiReply });
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
  
  if (currentChatId && allConversations[currentChatId]) {
    allConversations[currentChatId].messages = conversationHistory;
    localStorage.setItem("allConversations", JSON.stringify(allConversations));
  }

  scrollToLatest();
  return true;
}

conversationHistory.forEach(msg => {
  let div = document.createElement("div");
  div.classList.add(msg.sender === "User" ? "chatTexts" : "aiTexts");
  div.innerHTML = `<p>${msg.text}</p>`;
  chatsectionDiv.appendChild(div);
});

function scrollToLatest() {
  const latestMsg = document.getElementById("latestMsg");
  if (latestMsg) {
    latestMsg.scrollIntoView({ behavior: "smooth", block: "end" });
    setTimeout(() => {
      window.scrollBy(0, 180);
    }, 300);
  }
}

async function handleApiCall(userText) {
  try {
    let response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAj52FLcVsU60wgiGIYIfEn07L0x5Ypbnk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{
              text: `You are a professional AI career advisor, delivering concise and polished responses in a formal yet approachable tone, like a career counselor. Provide short responses (1-2 sentences) focused on job suggestions, career advice, or skill recommendations, tailored to the user's selected skills: <ul>${selectedSkills.map(skill => `<li>${skill}</li>`).join("")}</ul>. Always include 1-2 brief follow-up questions to refine suggestions until the user is satisfied. Keep responses compact to fit within a 400px-wide container. Use simple HTML for formatting:
- Bullet points: <ul><li> for lists, keeping items concise.
- Tables: <table border="1"><tr><th>Header</th></tr><tr><td>Item</td></tr></table> for pros/cons or comparisons, respecting 400px width.
- Highlight key text: <span class="highlight-primary">text</span> for emphasis or <span class="highlight-secondary">text</span> for secondary points.
- Links: <a href="url">text</a> for resources, ensuring clarity.
- Use emojis sparingly (e.g., ✅), only for subtle emphasis. Avoid markdown (no ** or #) and casual slang.

Current conversation topic is: ${currentTopic}. 
Conversation so far:
${conversationHistory.map(m => `${m.sender}: ${m.text}`).join("\n")}

IMPORTANT: Only suggest starting a new chat if the user changes to a completely different topic (like sports, weather, entertainment) from IT careers. DO NOT suggest new chats for inappropriate language - that should be handled separately.

If the user's last message, "${userText}", is a different topic from the current one (IT careers) and NOT inappropriate language, respond with: "That's an interesting topic! I'd be happy to discuss it. Since we're currently focused on IT careers, would you like to continue here or start a new chat for this topic?"

Otherwise, respond as the career advisor.
`
            }]
          }
        ]
      })
    });
    
    let data = await response.json();
    let aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't provide a suggestion at this time. Could you share your professional background? ✅";
    
    const topicChangeKeywords = ["new chat", "different topic", "continue here", "start a new chat"];
    const profanityKeywords = ["inappropriate language", "refrain from using", "professional", "bad language"];
    
    const hasTopicSuggestion = topicChangeKeywords.some(keyword => 
      aiReply.toLowerCase().includes(keyword.toLowerCase())
    ) && !profanityKeywords.some(keyword => 
      aiReply.toLowerCase().includes(keyword.toLowerCase())
    );
    
    let aiText = document.createElement("div");
    aiText.classList.add("aiTexts");
    aiText.innerHTML = `<p>${aiReply.replace(/\n/g, "<br>")}</p>`;
    const oldLastAI = chatsectionDiv.querySelector("#latestMsg");
    if (oldLastAI) oldLastAI.removeAttribute("id");
    aiText.id = "latestMsg";
    chatsectionDiv.appendChild(aiText);

    conversationHistory.push({ sender: "AI", text: aiReply });
    localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
    if (currentChatId && allConversations[currentChatId]) {
      allConversations[currentChatId].messages = conversationHistory;
      localStorage.setItem("allConversations", JSON.stringify(allConversations));
    }

    if (hasTopicSuggestion) {
      setTimeout(() => {
        addNewChatSuggestion();
      }, 100);
    }

    scrollToLatest();

  } catch (err) {
    console.error("API Error:", err);
    let errorText = document.createElement("div");
    errorText.classList.add("aiTexts");
    errorText.innerHTML = `<p>An error occurred. Please try again or provide more details.</p>`;
    chatsectionDiv.appendChild(errorText);
    scrollToLatest();
  }
}

sendText.addEventListener("click", async () => {
  let userText = chatInput.value.trim();
  if (!userText) return;

  if (containsBadWords(userText)) {
    handleProfanity(userText);
    chatInput.value = "";
    return;
  }

  if (!currentChatId || !allConversations[currentChatId]) {
    let newId = Date.now().toString();
    let newName = "Chat " + (Object.keys(allConversations).length + 1);
    allConversations[newId] = { name: newName, messages: [] };
    currentChatId = newId;
    localStorage.setItem("allConversations", JSON.stringify(allConversations));
    localStorage.setItem("currentChatId", newId);
    renderHistory();
  }

  let chatText = document.createElement("div");
  chatText.classList.add("chatTexts");
  chatText.innerHTML = `<p>${userText}</p>`;
  const oldLast = chatsectionDiv.querySelector("#latestMsg");
  if (oldLast) oldLast.removeAttribute("id");
  chatText.id = "latestMsg";
  chatsectionDiv.appendChild(chatText);
  scrollToLatest();

  conversationHistory.push({ sender: "User", text: userText });
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));

  if (currentChatId && allConversations[currentChatId]) {
    allConversations[currentChatId].messages = conversationHistory;
    localStorage.setItem("allConversations", JSON.stringify(allConversations));
  }

  chatInput.value = "";
  handleApiCall(userText);
});

clearBTN.addEventListener("click", () => {
  if (conversationHistory.length > 0 && currentChatId) {
    let oldMsg = document.querySelector(".featureMsg");
    if (oldMsg) oldMsg.remove();
    let msgDiv = document.createElement("div");
    msgDiv.classList.add("featureMsg");
    msgDiv.innerHTML = `
      <span>Are you sure you want to clear chat?</span>
      <button id="confirmClear" class="confirmBtn">Confirm</button>
      <button id="cancelClear" class="cancelBtn">Cancel</button>
    `;
    document.body.appendChild(msgDiv);
    document.getElementById("confirmClear").addEventListener("click", () => {
      delete allConversations[currentChatId];
      localStorage.setItem("allConversations", JSON.stringify(allConversations));
      conversationHistory = [];
      chatsectionDiv.innerHTML = "";
      localStorage.removeItem("chatHistory");
      currentChatId = null;
      localStorage.removeItem("currentChatId");
      renderHistory();
      removeNewChatSuggestion();
      msgDiv.textContent = "Chat deleted";
      setTimeout(() => {
        msgDiv.remove();
      }, 2000);
    });
    document.getElementById("cancelClear").addEventListener("click", () => {
      msgDiv.remove();
    });
  }
});

chatInput.addEventListener("focus", () => {
  searchBtn.style.borderTopRightRadius = "20px";
  searchBtn.style.borderBottomRightRadius = "20px";
  searchBtn.style.borderTopLeftRadius = "20px";
  searchBtn.style.borderBottomLeftRadius = "20px";
  searchBtn.style.bottom = "-20px";
  searchBtn.style.right = "0";
  dnwBTN.style.bottom = "-20px";
  dnwBTN.style.left = "0";
  clearBTN.style.bottom = "-20px";
  clearBTN.style.left = "0";
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
  clearBTN.style.bottom = "0";
  clearBTN.style.left = "0";
});

function wellcome() {
  let well = document.getElementById("wellcome");
  if (chatsectionDiv.children.length === 0) {
    well.style.display = "flex";
  } else {
    well.style.display = "none";
  }
}

wellcome();
const observer = new MutationObserver(() => {
  wellcome();
});
observer.observe(chatsectionDiv, { childList: true });
const well = document.getElementById("wellcome");
const messages = [
  "just send me a 'hey' so we can start ",
  "Let's find your first job together",
  "Ask me about skills, jobs, or careers",
  "Ready to discover your path?",
  "ask anything"
];
let msgIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentMsg = messages[msgIndex];
  if (!isDeleting) {
    well.textContent = currentMsg.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentMsg.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }
  } else {
    well.textContent = currentMsg.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      msgIndex = (msgIndex + 1) % messages.length;
    }
  }
  const speed = isDeleting ? 40 : 100;
  setTimeout(typeEffect, speed);
}

typeEffect();
dnwBTN.addEventListener("click", () => {
  let oldMsg = document.querySelector(".featureMsg");
  if (oldMsg) oldMsg.remove();
  let msgDiv = document.createElement("div");
  msgDiv.classList.add("featureMsg");
  msgDiv.textContent = "Harshad is still working on this feature";
  document.body.appendChild(msgDiv);
  setTimeout(() => {
    msgDiv.remove();
  }, 4000);
});
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    let msgDiv = document.createElement("div");
    msgDiv.classList.add("featureMsg");
    msgDiv.textContent = "Dark mode applied";
    document.body.appendChild(msgDiv);
    setTimeout(() => {
      msgDiv.remove();
    }, 2500);
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    let msgDiv = document.createElement("div");
    msgDiv.classList.add("featureMsg");
    msgDiv.textContent = "light mode applied";
    document.body.appendChild(msgDiv);
    setTimeout(() => {
      msgDiv.remove();
    }, 2500);
  }
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.checked = true;
} else {
  document.body.classList.remove('dark-mode');
  themeToggle.checked = false;
}

const menuBtn = document.getElementById("menu");
const historyDiv = document.getElementById("history");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");
const newChatBtn = document.getElementById("newChatBtn");
let allConversations = JSON.parse(localStorage.getItem("allConversations")) || {};
let currentChatId = localStorage.getItem("currentChatId") || null;

function renderHistory() {
  historyDiv.innerHTML = "";
  Object.keys(allConversations).forEach(id => {
    let span = document.createElement("span");
    span.classList.add("historyText");
    span.textContent = allConversations[id].name;
    let delIcon = document.createElement("i");
    delIcon.classList.add("fa-solid", "fa-xmark", "historyDelbtn");
    span.appendChild(delIcon);
    span.addEventListener("click", () => {
      if (id !== currentChatId) {
        currentChatId = id;
        localStorage.setItem("currentChatId", id);
        loadConversation(id);
        removeNewChatSuggestion();
      }
    });
    delIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      let oldMsg = document.querySelector(".featureMsg");
      if (oldMsg) oldMsg.remove();
      let msgDiv = document.createElement("div");
      msgDiv.classList.add("featureMsg");
      msgDiv.innerHTML = `
        <span>Are you sure you want to clear chat?</span>
        <button id="confirmClear" class="confirmBtn">Confirm</button>
        <button id="cancelClear" class="cancelBtn">Cancel</button>
      `;
      document.body.appendChild(msgDiv);
      document.getElementById("confirmClear").addEventListener("click", () => {
        delete allConversations[id];
        if (currentChatId === id) {
          currentChatId = null;
          chatsectionDiv.innerHTML = "";
          localStorage.removeItem("chatHistory");
          removeNewChatSuggestion();
        }
        localStorage.setItem("allConversations", JSON.stringify(allConversations));
        renderHistory();
        msgDiv.remove();
      });
      document.getElementById("cancelClear").addEventListener("click", () => {
        msgDiv.remove();
      });
    });
    historyDiv.appendChild(span);
  });
}

function loadConversation(id) {
  chatsectionDiv.innerHTML = "";
  conversationHistory = allConversations[id].messages;
  conversationHistory.forEach(msg => {
    let div = document.createElement("div");
    div.classList.add(msg.sender === "User" ? "chatTexts" : "aiTexts");
    div.innerHTML = `<p>${msg.text}</p>`;
    chatsectionDiv.appendChild(div);
  });
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
  removeNewChatSuggestion();
}

function createNewChat() {
  if(conversationHistory.length > 0 || Object.keys(allConversations).length > 0){
      let msgDiv = document.createElement("div");
      msgDiv.classList.add("featureMsg");
      msgDiv.innerHTML = `<span>New chat created</span>`;
      document.body.appendChild(msgDiv);
      setTimeout(() => {
        msgDiv.remove();
      }, 2500);
  }
  chatsectionDiv.innerHTML = "";
  conversationHistory = [];
  localStorage.setItem("chatHistory", JSON.stringify([]));
  let newId = Date.now().toString();
  let newName = "Chat " + (Object.keys(allConversations).length + 1);
  allConversations[newId] = { name: newName, messages: [] };
  currentChatId = newId;
  localStorage.setItem("allConversations", JSON.stringify(allConversations));
  localStorage.setItem("currentChatId", newId);
  renderHistory();
  removeNewChatSuggestion();
}

if (!currentChatId || !allConversations[currentChatId]) {
  if (Object.keys(allConversations).length === 0) {
    createNewChat(); 
  } else {
    let firstId = Object.keys(allConversations)[0];
    currentChatId = firstId;
    localStorage.setItem("currentChatId", firstId);
    loadConversation(firstId);
  }
} else {
  loadConversation(currentChatId);
}
renderHistory();

newChatBtn.addEventListener("click", createNewChat);

menuBtn.onclick = () => {
  if (historyDiv.classList.contains("active")) {
    historyDiv.classList.remove("active");
    setTimeout(() => { historyDiv.style.display = "none"; }, 300);
    menuIcon.style.display = "inline-block";
    closeIcon.style.display = "none";
  } else {
    historyDiv.style.display = "flex";
    setTimeout(() => { historyDiv.classList.add("active"); }, 10);
    menuIcon.style.display = "none";
    closeIcon.style.display = "inline-block"; 
  }
};

const addSkillsBtn = document.getElementById("addSkillsBtn");
addSkillsBtn.addEventListener("click", () => {
  let oldPopup = document.getElementById("skillsPopup");
  if (oldPopup) {
    oldPopup.remove();
    return;
  }
  let popup = document.createElement("div");
  popup.id = "skillsPopup";
  popup.innerHTML = `
    <h3>Your Skills & Interests</h3>
    <p>Select from the options:</p>
    <div class="skills-container">
      <span class="skill-tag ${selectedSkills.includes("Web Development") ? "selected" : ""}">Web Development</span>
      <span class="skill-tag ${selectedSkills.includes("Java") ? "selected" : ""}">Java</span>
      <span class="skill-tag ${selectedSkills.includes("Python") ? "selected" : ""}">Python</span>
      <span class="skill-tag ${selectedSkills.includes("UI/UX") ? "selected" : ""}">UI/UX</span>
      <span class="skill-tag ${selectedSkills.includes("Data Analysis") ? "selected" : ""}">Data Analysis</span>
      <span class="skill-tag ${selectedSkills.includes("AI/ML") ? "selected" : ""}">AI/ML</span>
      <span class="skill-tag ${selectedSkills.includes("Cybersecurity") ? "selected" : ""}">Cybersecurity</span>
    </div>
    <button id="closeSkillsBtn">Close</button>
  `;
  document.body.appendChild(popup);
  document.getElementById("closeSkillsBtn").addEventListener("click", () => {
    localStorage.setItem("selectedSkills", JSON.stringify(selectedSkills));
    popup.remove();
  });
  document.querySelectorAll(".skill-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      tag.classList.toggle("selected");
      const skill = tag.textContent;
      if (tag.classList.contains("selected")) {
        if (!selectedSkills.includes(skill)) {
          selectedSkills.push(skill);
        }
      } else {
        selectedSkills = selectedSkills.filter(s => s !== skill);
      }
    });
  });
});
