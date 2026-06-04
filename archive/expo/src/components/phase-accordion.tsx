import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// Fixed: Using lucide-react-native to prevent bundler errors
import { ChevronDown, ChevronUp, BookOpen, CheckCircle } from 'lucide-react-native';

interface AccordionItemProps {
  title: string;
  subtitle: string;
  content: string;
  isLocked?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, subtitle, content, isLocked = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    // Defensive Layout Handling: Defer state/animation execution to the next frame
    // to prevent native unmount crashes (TypeError: Cannot read property of undefined)
    setTimeout(() => {
      if (isOpen) {
        Animated.timing(animatedController, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false, // Keeping false for layout height animations
        }).start(() => setIsOpen(false));
      } else {
        setIsOpen(true);
        Animated.timing(animatedController, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    }, 16); // 16ms frame-deferred window safety catch
  };

  return (
    <View style={[styles.card, isLocked && styles.lockedCard]}>
      <TouchableOpacity 
        style={styles.header} 
        onClick={toggleAccordion} 
        activeOpacity={0.7}
        disabled={isLocked}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.iconContainer}>
          {isLocked ? (
            <Text style={styles.lockText}>Locked</Text>
          ) : isOpen ? (
            <ChevronUp size={20} color="#002D62" />
          ) : (
            <ChevronDown size={20} color="#002D62" />
          )}
        </View>
      </TouchableOpacity>

      {isOpen && !isLocked && (
        <View style={styles.contentWrapper}>
          <Text style={styles.contentBody}>{content}</Text>
        </View>
      )}
    </View>
  );
};

export function PhaseAccordion() {
  // Built directly on your THINK + SMART Protocol Taxonomy
  const phases = [
    {
      title: "Phase 1: THINK",
      subtitle: "Therapeutic Integration of Nutritional Ketosis",
      content: "Explore the clinical science of brain energy, neurotransmitter optimization, and shifting your primary cellular fuel from glucose to ketones to stabilize neural networks."
    },
    {
      title: "Phase 2: SLEEP",
      subtitle: "Rest & Circadian Health",
      content: "Master environmental zeitgebers (light cues). Learn how to anchor your circadian rhythm to optimize sleep architecture, mitochondrial repair, and cortisol curves."
    },
    {
      title: "Phase 3: MOVE",
      subtitle: "Reclaiming Energy",
      content: "Low-friction activity patterns designed for cellular health. Learn to use gentle movement as a therapeutic tool for metabolic health without burning out your nervous system."
    },
    {
      title: "Phase 4: AVOID",
      subtitle: "Protecting the Brain",
      content: "Identify and eliminate hidden biological and emotional hazards, ranging from high-stress digital triggers to ultra-processed metabolic disruptors.",
      isLocked: true // Progressive lock system demonstration
    }
  ];

  return (
    <View style={styles.container}>
      {phases.map((phase, index) => (
        <AccordionItem 
          key={index}
          title={phase.title}
          subtitle={phase.subtitle}
          content={phase.content}
          isLocked={phase.isLocked}
        />
      ))}
    </View>
  );
}

export default PhaseAccordion;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2F3EE', // Soft Mint tone border
    shadowColor: '#002D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lockedCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EAEAEA',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002D62', // Premium Cobalt Blue Text
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A6B82',
    lineHeight: 18,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  lockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
    textTransform: 'uppercase',
  },
  contentWrapper: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4FAF8',
    paddingTop: 12,
  },
  contentBody: {
    fontSize: 15,
    lineHeight: 24, // Generous spacing for premium readability
    color: '#2D3748',
  },
});