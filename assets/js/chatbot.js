// Chatbot functionality
document.addEventListener('DOMContentLoaded', function () {
  const chatbotButton = document.getElementById('chatbot-button');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');

  // const API_URL = 'http://10.117.244.111:5000/ask'; #for local host testing 
  const API_URL = "https://resume-chat.onrender.com/ask";

  chatbotButton.addEventListener('click', function () {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active')) {
      chatbotInput.focus();
      if (chatbotMessages.children.length === 0) {
        addWelcomeMessage();
      }
    }
  });

  chatbotClose.addEventListener('click', function () {
    chatbotWindow.classList.remove('active');
  });

  function addWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = '<strong>👋 Welcome!</strong> Ask me anything about Deep Kothari\'s portfolio, skills, or projects.';
    chatbotMessages.appendChild(welcomeDiv);
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message loading';
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = `
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    `;
    chatbotMessages.appendChild(loadingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.remove();
  }

  chatbotSend.addEventListener('click', sendMessage);

  chatbotInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    addMessage(message, true);

    chatbotInput.value = '';
    chatbotSend.disabled = true;
    chatbotInput.disabled = true;

    showLoading();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: message })
      });

      hideLoading();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // --- STREAM READING ---
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";

      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'message bot';
      chatbotMessages.appendChild(botMsgDiv);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        botMessage += chunk;
        botMsgDiv.textContent = botMessage;

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

    } catch (error) {
      console.error('Error calling chatbot API:', error);
      hideLoading();
      addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", false);
    } finally {
      chatbotSend.disabled = false;
      chatbotInput.disabled = false;
      chatbotInput.focus();
    }
  }

});
