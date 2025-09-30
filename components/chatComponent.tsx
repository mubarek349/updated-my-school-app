"use client";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bouncy } from "ldrs/react";

export default function ChatComponent({ packageId }: { packageId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"chatgpt" | "gemini">(
    "chatgpt"
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSamplePDF = async (): Promise<string> => {
    try {
      const response = await fetch("/apidata/sample.pdf");
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      return base64;
    } catch (error) {
      console.error("Error loading sample PDF:", error);
      return "";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiEndpoint =
        selectedModel === "chatgpt" ? "/api/chatgpt" : "/api/gemine";

      console.log("Sending request to:", apiEndpoint);
      console.log("Package ID:", packageId);
      console.log("Selected model:", selectedModel);

      // Load sample PDF for ChatGPT
      let fileData = null;
      if (selectedModel === "chatgpt") {
        const samplePDFBase64 = await loadSamplePDF();
        if (samplePDFBase64) {
          fileData = [
            {
              type: "input_file",
              filename: "sample.pdf",
              file_data: samplePDFBase64,
            },
          ];
        }
      }

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          packageId,
          files: fileData,
        }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `API Error: ${errorData.error || res.statusText}`,
          },
        ]);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Response data:", data);

      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: "No response from AI model." },
        ]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Network error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 py-4">
      <div className="flex flex-col w-full max-w-lg h-[400px] sm:h-[500px] border rounded-lg shadow-lg bg-white">
        {/* Sticky Model Selection Tabs */}
        <div className="sticky top-0 z-10 bg-white border-b rounded-t-lg">
          <Tabs
            value={selectedModel}
            onValueChange={(value) =>
              setSelectedModel(value as "chatgpt" | "gemini")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-none">
              <TabsTrigger
                value="chatgpt"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Model 1</span>
                  <span className="text-xs opacity-70">ChatGPT</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="gemini"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Model 2</span>
                  <span className="text-xs opacity-70">Gemini</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50/30">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-4 p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-50 border-l-4 border-blue-500 ml-4"
                  : m.role === "system"
                  ? "bg-red-50 border-l-4 border-red-500 mr-4"
                  : "bg-green-50 border-l-4 border-green-500 mr-4"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    m.role === "user"
                      ? "bg-blue-500"
                      : m.role === "system"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {m.role === "user"
                    ? "You"
                    : m.role === "system"
                    ? "System"
                    : selectedModel === "chatgpt"
                    ? "ChatGPT"
                    : "Gemini"}
                </span>
              </div>
              <div className="text-sm text-gray-800 break-words leading-relaxed">
                {m.content}
              </div>
            </div>
          ))}

          {/* Loading Animation */}
          {isLoading && (
            <div
              className={`mb-4 p-3 rounded-lg bg-green-50 border-l-4 border-green-500 mr-4`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {selectedModel === "chatgpt" ? "ChatGPT" : "Gemini"}
                </span>
              </div>
              <div className="flex items-center justify-center py-4">
                <Bouncy size="45" speed="1.75" color="#10b981" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div className="sticky bottom-0 bg-white border-t p-2 sm:p-3 rounded-b-lg">
          {/* Sample PDF Indicator */}
          {selectedModel === "chatgpt" && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📄</span>
                <span className="text-xs font-medium text-blue-600">
                  Using sample.pdf for ChatGPT analysis
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) sendMessage();
              }}
              placeholder={
                isLoading
                  ? "AI is thinking..."
                  : `Ask ${
                      selectedModel === "chatgpt" ? "ChatGPT" : "Gemini"
                    }...`
              }
              disabled={isLoading}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI is thinking...</span>
              </div>
            ) : (
              `Using ${
                selectedModel === "chatgpt" ? "ChatGPT" : "Gemini"
              } • Press Enter to send`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
