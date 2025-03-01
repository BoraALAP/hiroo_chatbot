# Embedding the Hiroo Chatbot on Webflow

This guide explains how to embed your Hiroo chatbot on a Webflow website while hosting the Next.js application on Vercel.

## Prerequisites

1. Your chatbot is deployed to Vercel
2. You have access to edit your Webflow site
3. You have set up the necessary environment variables in Vercel:
   - `NEXT_PUBLIC_ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://your-webflow-site.com,https://www.your-webflow-site.com`)

## Option 1: Using the JavaScript Widget (Recommended)

The JavaScript widget creates a floating chat button that expands into a chat window when clicked. This is the most seamless integration method.

### Step 1: Add the Widget Script to Webflow

1. In Webflow, go to your site's dashboard
2. Navigate to **Site Settings** > **Custom Code**
3. In the **Footer Code** section, add the following code:

```html
<script src="https://your-chatbot.vercel.app/widget.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.initChatWidget({
      position: 'bottom-right',
      primaryColor: '#4A90E2',
      title: 'Chat Support',
      greeting: 'Hello! How can I help you today?'
    });
  });
</script>
```

4. Replace `https://your-chatbot.vercel.app` with your actual Vercel deployment URL
5. Customize the widget options as needed:
   - `position`: 'bottom-right' or 'bottom-left'
   - `primaryColor`: Any hex color code
   - `title`: The title shown in the chat header
   - `greeting`: The initial message from the assistant
   - `width`: Width of the chat window (default: '350px')
   - `height`: Height of the chat window (default: '500px')

### Step 2: Publish Your Webflow Site

1. Save your changes
2. Publish your Webflow site
3. Test the chatbot by clicking on the chat button

## Option 2: Using an iframe

If you prefer to embed the chatbot directly into a specific page or section, you can use an iframe.

### Step 1: Add an HTML Embed Element in Webflow

1. In the Webflow Designer, add an **HTML Embed** element to your page
2. Add the following code:

```html
<iframe 
  src="https://your-chatbot.vercel.app/chat-embed" 
  width="100%" 
  height="600px" 
  frameborder="0"
  allow="microphone"
></iframe>
```

3. Replace `https://your-chatbot.vercel.app` with your actual Vercel deployment URL
4. Adjust the width and height as needed

### Step 2: Style the Container

1. Add a div around the HTML Embed element
2. Style the container as needed (add borders, shadows, etc.)

## Vercel Deployment Configuration

When deploying to Vercel, make sure to:

1. Set the `NEXT_PUBLIC_ALLOWED_ORIGINS` environment variable with your Webflow site's domain(s)
2. Configure other required environment variables for your chatbot (API keys, etc.)
3. Deploy from the main branch of your repository

## Troubleshooting

### CORS Issues

If you encounter CORS errors in the browser console:

1. Check that your Vercel environment has `NEXT_PUBLIC_ALLOWED_ORIGINS` set correctly
2. Verify that the origin of your Webflow site matches exactly what you've allowed
3. Check the Network tab in browser DevTools to see if the preflight OPTIONS requests are succeeding

### Widget Not Appearing

1. Check the browser console for JavaScript errors
2. Verify that the widget.js file is loading correctly
3. Make sure the DOMContentLoaded event is firing before initializing the widget

### Chat Not Working

1. Verify that your API routes are accessible from the Webflow domain
2. Check that your Supabase and other backend services are properly configured
3. Look for errors in the browser console or server logs

## Advanced Customization

For more advanced customization:

1. Fork the widget.js file and modify it to match your branding
2. Create custom CSS to style the chat interface
3. Add additional features like file uploads or voice input

## Getting Help

If you encounter issues with the integration, please:

1. Check the browser console for errors
2. Review your Vercel deployment logs
3. Contact support with specific error messages and screenshots 