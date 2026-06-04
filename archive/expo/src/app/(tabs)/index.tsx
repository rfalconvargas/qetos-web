import { useChat as useAiChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, Mic, Sparkles } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ChatPart = {
  type: string;
  text?: string;
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user' | 'system' | 'data';
  content?: string;
  parts?: ChatPart[];
};

type QuickReply = {
  label: 'A' | 'B' | 'C';
  value: string;
};

const QUICK_REPLIES: QuickReply[] = [
  { label: 'A', value: 'Log avocado and sardines as my clean fuel anchor.' },
  { label: 'B', value: 'I noticed an energy spike and want to investigate what caused it.' },
  { label: 'C', value: 'I had an energy crash and need help tracing the pattern.' },
];

function getLocalChatApiUrl() {
  if (Platform.OS === 'web') return '/api/chat';

  const expoConstants = Constants as typeof Constants & {
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };
  const hostUri =
    expoConstants.expoConfig?.hostUri ??
    expoConstants.manifest2?.extra?.expoClient?.hostUri ??
    expoConstants.manifest?.debuggerHost;

  if (hostUri) {
    const [host, port = '8081'] = hostUri.split(':');
    return `http://${host}:${port}/api/chat`;
  }

  return '/api/chat';
}

function getMessageText(message: ChatMessage) {
  if (typeof message.content === 'string') return message.content;

  return (
    message.parts
      ?.filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('') ?? ''
  );
}

function useChat({ api }: { api: string }) {
  const [input, setInput] = useState('');
  const transport = useMemo(() => new DefaultChatTransport({ api }), [api]);
  const { messages, sendMessage } = useAiChat({ transport });

  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }, overrideInput?: string) => {
      event?.preventDefault?.();

      const submittedInput = (overrideInput ?? input).trim();
      if (!submittedInput) return;

      setInput('');
      sendMessage({ text: submittedInput });
    },
    [input, sendMessage]
  );

  return {
    messages: messages as ChatMessage[],
    input,
    setInput,
    handleSubmit,
  };
}

export default function AIConciergeHub() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, input, setInput, handleSubmit } = useChat({ api: getLocalChatApiUrl() });

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 64);
  }, [messages]);

  const handleQuickReply = useCallback(
    (value: string) => {
      setInput(value);
      setTimeout(() => handleSubmit(undefined, value), 0);
    },
    [handleSubmit, setInput]
  );

  return (
    <View style={styles.masterContainer}>
      <LinearGradient
        colors={['#0F4C42', '#0F766E', '#0D9488']}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['transparent', 'rgba(74, 222, 128, 0.07)', 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <BlurView intensity={20} tint="dark" style={styles.frostedHeaderCard}>
          <View style={styles.headerTitleRow}>
            <Sparkles size={16} color="#2DD4BF" />
            <Text style={styles.headerTag}>Energy Coach</Text>
          </View>
          <Text style={styles.headerQuestion}>
            Live metabolic concierge stream is ready.
          </Text>
        </BlurView>

        <ScrollView
          ref={scrollViewRef}
          style={styles.streamScroll}
          contentContainerStyle={styles.streamContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start a diagnostic loop</Text>
              <Text style={styles.emptyBody}>
                Log a meal, symptom, sleep detail, or energy pattern and Claude will stream a
                targeted coaching response.
              </Text>
            </View>
          ) : null}

          {messages.map((message, index) => {
            const text = getMessageText(message);
            const isAssistant = message.role === 'assistant';
            const isLastAssistant =
              isAssistant &&
              messages.slice(index + 1).every((nextMessage) => nextMessage.role !== 'assistant');

            return (
              <View key={message.id}>
                <View
                  style={[
                    styles.messageContainer,
                    isAssistant ? styles.aiAlign : styles.userAlign,
                  ]}
                >
                  {isAssistant ? (
                    <View style={[styles.msgBubble, styles.aiFrostedBubble]}>
                      <BlurView
                        intensity={18}
                        tint="dark"
                        style={StyleSheet.absoluteFillObject}
                      />
                      <Text style={[styles.msgText, styles.aiText]}>{text}</Text>
                    </View>
                  ) : (
                    <View style={[styles.msgBubble, styles.userBubble]}>
                      <Text style={[styles.msgText, styles.userText]}>{text}</Text>
                    </View>
                  )}
                </View>

                {isLastAssistant ? (
                  <View style={styles.quickReplyRow}>
                    {QUICK_REPLIES.map((reply) => (
                      <TouchableOpacity
                        key={reply.label}
                        style={styles.quickReplyPill}
                        onPress={() => handleQuickReply(reply.value)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.quickReplyText}>
                          {reply.label}: {reply.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputTrayCapsule}>
          <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
            <Mic size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInputField}
            placeholder="Log foods, symptoms, or energy levels..."
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity
            style={styles.submitNodeButton}
            onPress={() => handleSubmit()}
            activeOpacity={0.8}
          >
            <ArrowUp size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
  },
  avoidingView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  frostedHeaderCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
    textTransform: 'uppercase',
    marginLeft: 6,
    letterSpacing: 1,
  },
  headerQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2F3EE',
    lineHeight: 22,
  },
  streamScroll: {
    flex: 1,
    marginVertical: 8,
  },
  streamContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    marginTop: 20,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#D1FAE5',
  },
  messageContainer: {
    width: '100%',
    marginVertical: 6,
    flexDirection: 'row',
  },
  userAlign: {
    justifyContent: 'flex-end',
  },
  aiAlign: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    padding: 16,
    borderRadius: 24,
    maxWidth: '88%',
  },
  userBubble: {
    backgroundColor: '#0F766E',
    borderBottomRightRadius: 4,
  },
  aiFrostedBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  msgText: {
    fontSize: 15,
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#FFFFFF',
  },
  quickReplyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 4,
    marginVertical: 8,
  },
  quickReplyPill: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxWidth: '100%',
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  inputTrayCapsule: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputField: {
    flex: 1,
    maxHeight: 110,
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 20,
    color: '#0F172A',
  },
  submitNodeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
