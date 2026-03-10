'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Send, Sparkles, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { chatbotApi, ChatMessage } from '@/lib/api';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: chatbotApi.chat,
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Send to API
    chatMutation.mutate({
      message: userMessage,
      history: messages,
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    if (chatMutation.isPending) return;

    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    // Send to API
    chatMutation.mutate({
      message: prompt,
      history: messages,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Conversation cleared');
  };

  const examplePrompts = [
    "How do I improve volunteer retention?",
    "Best practices for matching volunteers to campaigns?",
    "What should I do when engagement drops?",
    "How to run effective volunteer onboarding?",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8 text-purple-600" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Get instant help with volunteer management, campaign planning, and retention strategies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Example Prompts Sidebar - Always visible */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Quick Prompts
              </CardTitle>
              <CardDescription className="text-xs">
                Click to use or type your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {examplePrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full h-auto py-2.5 px-3 text-left justify-start whitespace-normal text-xs hover:bg-purple-600 hover:text-white border-purple-200 transition-colors"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={chatMutation.isPending}
                >
                  <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span>{prompt}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Card */}
        <Card className="lg:col-span-2 flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Chat with AI Assistant
              </CardTitle>
              <CardDescription>
                AI-generated responses for volunteer management guidance
              </CardDescription>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Ready to help!</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Click a quick prompt on the left or type your question below
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input Area - Always visible at bottom */}
        <div className="border-t p-4 flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about volunteer management..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={chatMutation.isPending}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="lg"
              className="px-6 h-auto"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This AI assistant provides general guidance. Always verify important decisions with your organization's policies.
        </AlertDescription>
      </Alert>
    </div>
  );
}
      