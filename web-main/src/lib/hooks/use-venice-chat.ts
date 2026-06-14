"use client";

import { useState, useCallback, useRef } from "react";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type VeniceChatState = {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  error: string | null;
};

/**
 * `useVeniceChat`
 *
 * Hook for the Venice AI-powered chat assistant.
 * Messages are sent to the zkPull backend which proxies to Venice AI.
 *
 * ## Usage
 * ```tsx
 * const { messages, sendMessage, isTyping, toggle } = useVeniceChat();
 *
 * // Send a message
 * await sendMessage("How do I create a bounty?");
 * ```
 */
export function useVeniceChat() {
  // Default backend URL — override via env or make relative
  const backendUrl =
    process.env.NEXT_PUBLIC_ZK_BACKEND_CHAT ||
    process.env.NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF?.replace(
      "/generate-proof",
      ""
    ) ||
    "http://localhost:5000";

  const [state, setState] = useState<VeniceChatState>({
    messages: [],
    isOpen: false,
    isTyping: false,
    error: null,
  });

  const messagesRef = useRef<ChatMessage[]>([]);

  /**
   * Toggle the chat dialog open/closed.
   */
  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  /**
   * Open the chat dialog.
   */
  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  /**
   * Close the chat dialog.
   */
  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Send a message to the Venice AI assistant.
   *
   * @param message - The user's message
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: message.trim(),
      };

      // Optimistically add user message
      const updatedMessages = [...messagesRef.current, userMessage];
      messagesRef.current = updatedMessages;

      setState((prev) => ({
        ...prev,
        messages: updatedMessages,
        isTyping: true,
        error: null,
      }));

      try {
        const response = await fetch(`${backendUrl}/api/venice/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
            history: messagesRef.current.slice(0, -1),
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.response || "I'm not sure how to respond to that.",
        };

        const finalMessages = [...messagesRef.current, assistantMessage];
        messagesRef.current = finalMessages;

        setState((prev) => ({
          ...prev,
          messages: finalMessages,
          isTyping: false,
        }));
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to reach AI assistant";

        // Add a fallback error message
        const errorAssistantMessage: ChatMessage = {
          role: "assistant",
          content: `I apologize, but I'm having trouble connecting right now. Please make sure the backend server is running on port 5000 with a valid VENICE_API_KEY. Error: ${errorMsg}`,
        };

        const finalMessages = [...messagesRef.current, errorAssistantMessage];
        messagesRef.current = finalMessages;

        setState((prev) => ({
          ...prev,
          messages: finalMessages,
          isTyping: false,
          error: errorMsg,
        }));
      }
    },
    [backendUrl]
  );

  /**
   * Clear the chat history.
   */
  const clearHistory = useCallback(() => {
    messagesRef.current = [];
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    toggle,
    open,
    close,
    clearHistory,
  };
}
