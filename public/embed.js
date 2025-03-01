/**
 * Help Center Chatbot Embed Script
 * 
 * This script allows you to embed the Help Center Chatbot in any website.
 * Simply include this script in your website and initialize it with your configuration.
 * 
 * Example:
 * <script src="https://your-deployed-url.vercel.app/embed.js"></script>
 * <script>
 *   document.addEventListener('DOMContentLoaded', function() {
 *     window.HelpCenterChatbot.init({
 *       position: 'bottom-right',
 *       primaryColor: '#0070f3',
 *       greeting: 'Hi there! How can I help you today?'
 *     });
 *   });
 * </script>
 */

(function() {
  // Default configuration
  const defaultConfig = {
    position: 'bottom-right',
    primaryColor: '#0070f3',
    greeting: 'How can I help you today?',
    title: 'Product Support',
    subtitle: 'Ask me anything about our product'
  };

  // Create iframe element
  function createIframe(config) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.maxWidth = '400px';
    iframe.style.maxHeight = '600px';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    iframe.style.overflow = 'hidden';
    iframe.style.zIndex = '9999';
    iframe.style.display = 'none';
    iframe.style.transition = 'all 0.3s ease';
    
    // Set position
    if (config.position === 'bottom-right') {
      iframe.style.bottom = '80px';
      iframe.style.right = '20px';
    } else if (config.position === 'bottom-left') {
      iframe.style.bottom = '80px';
      iframe.style.left = '20px';
    } else if (config.position === 'top-right') {
      iframe.style.top = '20px';
      iframe.style.right = '20px';
    } else if (config.position === 'top-left') {
      iframe.style.top = '20px';
      iframe.style.left = '20px';
    }
    
    // Set src to the chatbot page
    iframe.src = window.location.origin + '/chat-embed';
    
    return iframe;
  }

  // Create toggle button
  function createToggleButton(config) {
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = config.primaryColor;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.outline = 'none';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    button.style.zIndex = '10000';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'all 0.3s ease';
    
    // Set position
    if (config.position === 'bottom-right') {
      button.style.bottom = '20px';
      button.style.right = '20px';
    } else if (config.position === 'bottom-left') {
      button.style.bottom = '20px';
      button.style.left = '20px';
    } else if (config.position === 'top-right') {
      button.style.top = '20px';
      button.style.right = '20px';
    } else if (config.position === 'top-left') {
      button.style.top = '20px';
      button.style.left = '20px';
    }
    
    // Chat icon
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <circle cx="9" cy="10" r="1"></circle>
        <circle cx="12" cy="10" r="1"></circle>
        <circle cx="15" cy="10" r="1"></circle>
      </svg>
    `;
    
    return button;
  }

  // Initialize the chatbot
  function init(userConfig = {}) {
    // Merge user config with default config
    const config = { ...defaultConfig, ...userConfig };
    
    // Create container
    const container = document.createElement('div');
    container.id = 'help-center-chatbot-container';
    
    // Create iframe
    const iframe = createIframe(config);
    
    // Create toggle button
    const toggleButton = createToggleButton(config);
    
    // Add click event to toggle button
    let isOpen = false;
    toggleButton.addEventListener('click', function() {
      isOpen = !isOpen;
      
      if (isOpen) {
        iframe.style.display = 'block';
        // Change button icon to close
        toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else {
        iframe.style.display = 'none';
        // Change button icon to chat
        toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <circle cx="9" cy="10" r="1"></circle>
            <circle cx="12" cy="10" r="1"></circle>
            <circle cx="15" cy="10" r="1"></circle>
          </svg>
        `;
      }
    });
    
    // Add elements to container
    container.appendChild(iframe);
    container.appendChild(toggleButton);
    
    // Add container to document
    document.body.appendChild(container);
    
    // Send config to iframe
    setTimeout(() => {
      iframe.contentWindow.postMessage({ type: 'CHATBOT_CONFIG', config }, '*');
    }, 1000);
  }

  // Expose the init function globally
  window.HelpCenterChatbot = {
    init
  };
})(); 