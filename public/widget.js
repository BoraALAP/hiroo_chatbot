(function() {
  // Configuration defaults
  const defaultConfig = {
    position: 'bottom-right',
    primaryColor: '#00015E',
    greeting: 'Hello! How can I help you today3?',
    title: 'Hiroo Chat Support',
    width: '350px',
    height: '500px',
    buttonIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
    </svg>`,
    isExpanded: false
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
    
    // Create header for chat window
    const chatHeader = document.createElement('div');
    chatHeader.id = 'hiroo-chat-header';
    chatHeader.style.display = 'flex';
    chatHeader.style.justifyContent = 'space-between';
    chatHeader.style.alignItems = 'center';
    chatHeader.style.padding = '10px 15px';
    chatHeader.style.backgroundColor = config.primaryColor;
    chatHeader.style.color = 'white';
    chatHeader.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    chatHeader.style.fontWeight = 'bold';
    chatHeader.style.borderTopLeftRadius = '10px';
    chatHeader.style.borderTopRightRadius = '10px';
    chatHeader.style.cursor = 'move'; // Indicates it can be used to drag
    chatWindow.appendChild(chatHeader);
    
    // Add title to header
    const headerTitle = document.createElement('div');
    headerTitle.textContent = config.title;
    chatHeader.appendChild(headerTitle);
    
    // Add buttons container to header
    const headerButtons = document.createElement('div');
    headerButtons.style.display = 'flex';
    headerButtons.style.gap = '8px';
    chatHeader.appendChild(headerButtons);
    
    // Add expand button to header
    const expandButton = document.createElement('div');
    expandButton.id = 'hiroo-chat-expand';
    expandButton.style.width = '24px';
    expandButton.style.height = '24px';
    expandButton.style.borderRadius = '4px';
    expandButton.style.display = 'flex';
    expandButton.style.justifyContent = 'center';
    expandButton.style.alignItems = 'center';
    expandButton.style.cursor = 'pointer';
    expandButton.style.transition = 'background-color 0.2s, opacity 0.2s';
    expandButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3V6H2V2H6V3H3ZM13 3H10V2H14V6H13V3ZM3 13H6V14H2V10H3V13ZM13 13V10H14V14H10V13H13Z" fill="white"/>
    </svg>`;
    expandButton.style.opacity = '0.8';
    headerButtons.appendChild(expandButton);
    
    // Add hover effect for expand button
    expandButton.addEventListener('mouseover', function() {
      expandButton.style.opacity = '1';
      expandButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    expandButton.addEventListener('mouseout', function() {
      expandButton.style.opacity = '0.8';
      expandButton.style.backgroundColor = 'transparent';
    });
    
    // Add close button to header
    const headerCloseButton = document.createElement('div');
    headerCloseButton.id = 'hiroo-chat-header-close';
    headerCloseButton.style.width = '24px';
    headerCloseButton.style.height = '24px';
    headerCloseButton.style.borderRadius = '4px';
    headerCloseButton.style.display = 'flex';
    headerCloseButton.style.justifyContent = 'center';
    headerCloseButton.style.alignItems = 'center';
    headerCloseButton.style.cursor = 'pointer';
    headerCloseButton.style.transition = 'background-color 0.2s, opacity 0.2s';
    headerCloseButton.innerHTML = '✕';
    headerCloseButton.style.opacity = '0.8';
    headerButtons.appendChild(headerCloseButton);
    
    // Add hover effect for close button
    headerCloseButton.addEventListener('mouseover', function() {
      headerCloseButton.style.opacity = '1';
      headerCloseButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    headerCloseButton.addEventListener('mouseout', function() {
      headerCloseButton.style.opacity = '0.8';
      headerCloseButton.style.backgroundColor = 'transparent';
    });
    
    // Create iframe for chat content
    const chatIframe = document.createElement('iframe');
    chatIframe.style.width = '100%';
    chatIframe.style.height = 'calc(100% - 40px)'; // Subtract header height
    chatIframe.style.border = 'none';
    chatIframe.src = window.location.origin + '/chat-embed';
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
    
    // Close chat when header close button is clicked
    headerCloseButton.addEventListener('click', function(e) {
      e.stopPropagation();
      chatWindow.style.display = 'none';
    });
    
    // Toggle expanded state when expand button is clicked
    expandButton.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (config.isExpanded) {
        // Restore to original size
        chatWindow.style.width = config.width;
        chatWindow.style.height = config.height;
        chatWindow.style.bottom = '70px';
        chatWindow.style.right = '0';
        
        // Update expand button icon to expand
        expandButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V6H2V2H6V3H3ZM13 3H10V2H14V6H13V3ZM3 13H6V14H2V10H3V13ZM13 13V10H14V14H10V13H13Z" fill="white"/>
        </svg>`;
      } else {
        // Expand to larger size
        chatWindow.style.width = 'calc(100vw - 80px)';
        chatWindow.style.height = 'calc(100vh - 80px)';
        chatWindow.style.bottom = '20px';
        chatWindow.style.right = '20px';
        
        // Update expand button icon to minimize
        expandButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H12V12H4V4Z" fill="white"/>
        </svg>`;
      }
      
      config.isExpanded = !config.isExpanded;
    });
    
    // // Make header draggable to move the chat window
    // let isDragging = false;
    // let dragOffsetX, dragOffsetY;
    
    // chatHeader.addEventListener('mousedown', function(e) {
    //   isDragging = true;
    //   dragOffsetX = e.clientX - chatWindow.getBoundingClientRect().left;
    //   dragOffsetY = e.clientY - chatWindow.getBoundingClientRect().top;
    //   chatWindow.style.transition = 'none'; // Disable transitions while dragging
    // });
    
    // document.addEventListener('mousemove', function(e) {
    //   if (isDragging) {
    //     const x = e.clientX - dragOffsetX;
    //     const y = e.clientY - dragOffsetY;
        
    //     // Keep the window within viewport bounds
    //     const maxX = window.innerWidth - chatWindow.offsetWidth;
    //     const maxY = window.innerHeight - chatWindow.offsetHeight;
        
    //     chatWindow.style.right = 'auto';
    //     chatWindow.style.bottom = 'auto';
    //     chatWindow.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    //     chatWindow.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    //   }
    // });
    
    // document.addEventListener('mouseup', function() {
    //   if (isDragging) {
    //     isDragging = false;
    //     chatWindow.style.transition = 'all 0.3s ease'; // Re-enable transitions
    //   }
    // });
    
    // Handle messages from iframe
    window.addEventListener('message', function(event) {
      // Verify origin for security
      if (event.origin !== window.location.origin && event.origin !== 'https://hiroo-chatbot.vercel.app') return;
      
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
      },
      expand: function() {
        if (!config.isExpanded) {
          expandButton.click();
        }
      },
      minimize: function() {
        if (config.isExpanded) {
          expandButton.click();
        }
      }
    };
  };
})(); 