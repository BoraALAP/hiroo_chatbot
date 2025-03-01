(function() {
  // Configuration defaults
  const defaultConfig = {
    position: 'bottom-right',
    primaryColor: '#000000',
    greeting: 'Hello! How can I help you today?',
    title: 'Chat Support',
    width: '350px',
    height: '500px',
    buttonIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
    </svg>`
  };

  // Create and initialize the widget
  window.initChatWidget = function(userConfig = {}) {
    // Merge user config with defaults
    const config = { ...defaultConfig, ...userConfig };
    
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'hiroo-chat-widget-container';
    widgetContainer.style.position = 'fixed';
    
    // Set position based on config
    if (config.position === 'bottom-right') {
      widgetContainer.style.right = '20px';
      widgetContainer.style.bottom = '20px';
    } else if (config.position === 'bottom-left') {
      widgetContainer.style.left = '20px';
      widgetContainer.style.bottom = '20px';
    }
    
    widgetContainer.style.zIndex = '9999';
    document.body.appendChild(widgetContainer);
    
    // Create chat button
    const chatButton = document.createElement('div');
    chatButton.id = 'hiroo-chat-button';
    chatButton.style.width = '60px';
    chatButton.style.height = '60px';
    chatButton.style.borderRadius = '50%';
    chatButton.style.backgroundColor = config.primaryColor;
    chatButton.style.display = 'flex';
    chatButton.style.justifyContent = 'center';
    chatButton.style.alignItems = 'center';
    chatButton.style.cursor = 'pointer';
    chatButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    chatButton.style.transition = 'all 0.3s ease';
    chatButton.innerHTML = config.buttonIcon;
    widgetContainer.appendChild(chatButton);
    
    // Create chat window (initially hidden)
    const chatWindow = document.createElement('div');
    chatWindow.id = 'hiroo-chat-window';
    chatWindow.style.position = 'absolute';
    chatWindow.style.bottom = '70px';
    chatWindow.style.right = '0';
    chatWindow.style.width = config.width;
    chatWindow.style.height = config.height;
    chatWindow.style.backgroundColor = '#fff';
    chatWindow.style.borderRadius = '10px';
    chatWindow.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    chatWindow.style.overflow = 'hidden';
    chatWindow.style.display = 'none';
    chatWindow.style.flexDirection = 'column';
    widgetContainer.appendChild(chatWindow);
    
    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.padding = '15px';
    chatHeader.style.backgroundColor = config.primaryColor;
    chatHeader.style.color = '#fff';
    chatHeader.style.fontWeight = 'bold';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';
    chatHeader.innerHTML = `
      <div>${config.title}</div>
      <div id="hiroo-chat-close" style="cursor: pointer;">✕</div>
    `;
    chatWindow.appendChild(chatHeader);
    
    // Create iframe for chat content
    const chatIframe = document.createElement('iframe');
    chatIframe.style.width = '100%';
    chatIframe.style.height = 'calc(100% - 50px)';
    chatIframe.style.border = 'none';
    chatIframe.src = 'https://your-chatbot.vercel.app/chat-embed';
    chatIframe.allow = 'microphone';
    chatWindow.appendChild(chatIframe);
    
    // Toggle chat window when button is clicked
    chatButton.addEventListener('click', function() {
      if (chatWindow.style.display === 'none') {
        chatWindow.style.display = 'flex';
        // Send message to iframe that chat is opened
        setTimeout(() => {
          // Send both message types for compatibility with both implementations
          chatIframe.contentWindow.postMessage({ type: 'CHAT_OPENED', config }, '*');
          chatIframe.contentWindow.postMessage({ type: 'CHATBOT_CONFIG', config }, '*');
        }, 500);
      } else {
        chatWindow.style.display = 'none';
      }
    });
    
    // Close chat when close button is clicked
    document.getElementById('hiroo-chat-close').addEventListener('click', function(e) {
      e.stopPropagation();
      chatWindow.style.display = 'none';
    });
    
    // Handle messages from iframe
    window.addEventListener('message', function(event) {
      // Verify origin for security
      if (event.origin !== 'https://your-chatbot.vercel.app') return;
      
      const { type, height } = event.data;
      
      if (type === 'RESIZE_IFRAME' && height) {
        chatIframe.style.height = `${height}px`;
      }
    });
    
    // Return API for controlling the widget programmatically
    return {
      open: function() {
        chatWindow.style.display = 'flex';
        chatIframe.contentWindow.postMessage({ type: 'CHAT_OPENED', config }, '*');
        chatIframe.contentWindow.postMessage({ type: 'CHATBOT_CONFIG', config }, '*');
      },
      close: function() {
        chatWindow.style.display = 'none';
      },
      toggle: function() {
        if (chatWindow.style.display === 'none') {
          this.open();
        } else {
          this.close();
        }
      }
    };
  };
})(); 