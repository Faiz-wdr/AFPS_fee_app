import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export interface SuccessItemDetail {
  label?: string;
  value: React.ReactNode;
}

export interface SuccessAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export interface SuccessScreenProps {
  title?: string;
  description?: string;
  referenceNumber?: string;
  amount?: number | string;
  amountLabel?: string;
  details?: SuccessItemDetail[];
  primaryAction?: SuccessAction;
  secondaryAction?: SuccessAction;
  showConfetti?: boolean;
  align?: 'center' | 'left';
}

// Minimal, elegant confetti particle data
const CONFETTI_PARTICLES = [
  { id: 1, x: -36, y: -42, size: 6, color: '#4CAF50', delay: 0.2 },
  { id: 2, x: 38, y: -38, size: 5, color: '#5A54B4', delay: 0.22 },
  { id: 3, x: -50, y: -10, size: 6, color: '#81C784', delay: 0.25 },
  { id: 4, x: 48, y: -12, size: 5, color: '#A5D6A7', delay: 0.24 },
  { id: 5, x: -28, y: 32, size: 6, color: '#66BB6A', delay: 0.28 },
  { id: 6, x: 32, y: 30, size: 5, color: '#7E57C2', delay: 0.26 },
  { id: 7, x: -12, y: -48, size: 5, color: '#FFB74D', delay: 0.23 },
  { id: 8, x: 16, y: -46, size: 6, color: '#4CAF50', delay: 0.21 },
  { id: 9, x: -44, y: 15, size: 4, color: '#43A047', delay: 0.27 },
  { id: 10, x: 42, y: 14, size: 5, color: '#9FA8DA', delay: 0.25 }
];

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title = 'Payment Successfully Recorded!',
  description,
  referenceNumber,
  amount,
  amountLabel = 'Total Credited',
  details = [],
  primaryAction,
  secondaryAction,
  showConfetti = true,
  align = 'center'
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.35,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 4px 6px 4px',
        textAlign: 'center',
        width: '100%'
      }}
    >
      {/* Animated Checkmark Container */}
      <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '14px' }}>
        {/* Subtle Confetti Particles Burst */}
        {showConfetti && !shouldReduceMotion && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            {CONFETTI_PARTICLES.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0.4],
                  x: p.x,
                  y: p.y
                }}
                transition={{
                  duration: 0.65,
                  delay: p.delay,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: p.id % 2 === 0 ? '50%' : '2px',
                  backgroundColor: p.color
                }}
              />
            ))}
          </div>
        )}

        {/* Circular Spring Background */}
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 18,
            duration: shouldReduceMotion ? 0.01 : 0.45
          }}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* SVG Animated Circle & Checkmark */}
          <svg
            width="44"
            height="44"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            {/* Outer Circle Path */}
            <motion.circle
              cx="26"
              cy="26"
              r="23"
              stroke="#2E7D32"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.45,
                ease: 'easeOut'
              }}
            />
            {/* Checkmark Path */}
            <motion.path
              d="M15 27.5L22.5 35L37 19.5"
              stroke="#2E7D32"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: shouldReduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 0.28,
                duration: shouldReduceMotion ? 0.01 : 0.38,
                ease: 'easeOut'
              }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Title & Reference */}
      <motion.div variants={itemVariants} style={{ marginBottom: '14px' }}>
        <h3
          style={{
            fontSize: '19px',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: 'var(--color-text-primary, #1A1A2E)',
            letterSpacing: '-0.01em'
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              color: 'var(--color-text-secondary, #666677)',
              fontSize: '13px',
              margin: '0 0 4px 0',
              lineHeight: 1.45
            }}
          >
            {description}
          </p>
        )}
        {referenceNumber && (
          <div
            style={{
              display: 'inline-block',
              marginTop: '4px',
              fontSize: '11.5px',
              fontWeight: 600,
              fontFamily: 'monospace',
              color: 'var(--color-primary, #5A54B4)',
              backgroundColor: 'var(--color-primary-light, #F0EFFB)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            Receipt #{referenceNumber}
          </div>
        )}
      </motion.div>

      {/* Details Card */}
      {(details.length > 0 || amount !== undefined) && (
        <motion.div
          variants={itemVariants}
          style={{
            width: '100%',
            backgroundColor: '#F9F9FC',
            border: '1px solid var(--color-border, #E6E6EE)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: align === 'center' ? 'center' : 'left',
            alignItems: align === 'center' ? 'center' : 'stretch',
            fontSize: '13px',
            marginBottom: '16px'
          }}
        >
          {details.map((item, idx) => {
            const hasLabel = Boolean(item.label && item.label.trim().length > 0);
            if (align === 'center' || !hasLabel) {
              return (
                <div
                  key={idx}
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    lineHeight: 1.45,
                    fontSize: '13px'
                  }}
                >
                  {hasLabel && (
                    <span style={{ color: 'var(--color-text-secondary, #666677)', fontWeight: 500, marginRight: '4px' }}>
                      {item.label}:
                    </span>
                  )}
                  <span style={{ color: 'var(--color-text-primary, #1A1A2E)' }}>
                    {item.value}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #ECECF2',
                  paddingBottom: '7px'
                }}
              >
                <span style={{ color: 'var(--color-text-secondary, #666677)', fontWeight: 500 }}>
                  {item.label}:
                </span>
                <span style={{ color: 'var(--color-text-primary, #1A1A2E)' }}>
                  {item.value}
                </span>
              </div>
            );
          })}

          {amount !== undefined && (
            <div
              style={
                align === 'center'
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      paddingTop: details.length > 0 ? '10px' : '0',
                      borderTop: details.length > 0 ? '1px solid #ECECF2' : 'none',
                      marginTop: details.length > 0 ? '4px' : '0',
                      width: '100%'
                    }
                  : {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingTop: details.length > 0 ? '4px' : '0'
                    }
              }
            >
              {amountLabel && (
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary, #1A1A2E)',
                    fontSize: '13px'
                  }}
                >
                  {amountLabel}:
                </span>
              )}
              <span
                style={{
                  fontWeight: 800,
                  fontSize: align === 'center' ? '20px' : '17px',
                  color: 'var(--color-success, #2E7D32)'
                }}
              >
                {typeof amount === 'number' ? formatCurrency(amount) : amount}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons: Secondary on Left, Primary on Right */}
      {(primaryAction || secondaryAction) && (
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: secondaryAction ? 'space-between' : 'flex-end',
            width: '100%',
            gap: '12px'
          }}
        >
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'secondary'}
              icon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}

          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'primary'}
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
