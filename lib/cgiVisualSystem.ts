import type { CSSProperties } from 'react'

export const cgiVisualTokens = {
  colors: {
    black: '#050505',
    deepBlack: '#070707',
    panelBlack: '#090807',
    cardBlack: '#11100d',
    slate: '#111827',
    gold: '#d6b25e',
    goldStrong: '#c9a227',
    goldMuted: '#9f8142',
    goldSoft: 'rgba(214,178,94,0.12)',
    goldLine: 'rgba(214,178,94,0.28)',
    goldLineStrong: 'rgba(214,178,94,0.42)',
    textPrimary: '#fff8e7',
    textSecondary: '#cfc7b5',
    textMuted: '#9ca3af',
    textSlate: '#d1d5db',
    white: '#ffffff',
  },
  shadows: {
    executive: '0 25px 90px rgba(0,0,0,0.55)',
    card: '0 20px 60px rgba(0,0,0,0.35)',
  },
  gradients: {
    page:
      'radial-gradient(circle at top left, rgba(214,178,94,0.1), transparent 34%), linear-gradient(180deg, #050505 0%, #0b0b0b 50%, #111827 100%)',
    panel:
      'linear-gradient(135deg, rgba(214,178,94,0.11), rgba(255,255,255,0.025))',
    emphasis:
      'linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38))',
  },
} as const

export const cgiVisualStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: cgiVisualTokens.colors.textPrimary,
  },

  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gap: 24,
  },

  wideContainer: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'grid',
    gap: 24,
  },

  hero: {
    display: 'grid',
    gap: 24,
    padding: 32,
    borderRadius: 28,
    background: cgiVisualTokens.gradients.panel,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    boxShadow: cgiVisualTokens.shadows.executive,
  },

  heroSplit: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 0.65fr)',
    gap: 24,
    padding: 32,
    borderRadius: 28,
    background: cgiVisualTokens.gradients.panel,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    boxShadow: cgiVisualTokens.shadows.executive,
  },

  kicker: {
    margin: 0,
    color: cgiVisualTokens.colors.gold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },

  title: {
    margin: '12px 0 0',
    color: cgiVisualTokens.colors.textPrimary,
    fontSize: 'clamp(2.3rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },

  pageTitle: {
    margin: '10px 0',
    color: cgiVisualTokens.colors.textPrimary,
    fontSize: 'clamp(34px, 4vw, 52px)',
    lineHeight: 1,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },

  subtitle: {
    margin: '16px 0 0',
    maxWidth: 880,
    color: cgiVisualTokens.colors.textSecondary,
    fontSize: 15,
    lineHeight: 1.75,
  },

  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
  },

  darkPanel: {
    padding: 28,
    borderRadius: 28,
    background: cgiVisualTokens.colors.deepBlack,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
  },

  emphasisPanel: {
    padding: 28,
    borderRadius: 28,
    background: cgiVisualTokens.gradients.emphasis,
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
  },

  whitePanel: {
    padding: 28,
    borderRadius: 28,
    background: '#ffffff',
    color: '#0b0b0b',
    border: '1px solid rgba(255,255,255,0.12)',
  },

  card: {
    padding: 20,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
  },

  goldCard: {
    padding: 20,
    borderRadius: 20,
    background: cgiVisualTokens.colors.goldSoft,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
  },

  sectionKicker: {
    margin: 0,
    color: cgiVisualTokens.colors.goldMuted,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },

  panelTitle: {
    margin: '12px 0 0',
    color: cgiVisualTokens.colors.textPrimary,
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
    fontWeight: 900,
  },

  bodyText: {
    margin: '8px 0 0',
    color: cgiVisualTokens.colors.textSecondary,
    lineHeight: 1.7,
    fontSize: 14,
  },

  mutedText: {
    margin: 0,
    color: cgiVisualTokens.colors.textMuted,
    lineHeight: 1.6,
    fontSize: 13,
  },

  metricLabel: {
    margin: 0,
    color: cgiVisualTokens.colors.goldMuted,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },

  metricValue: {
    margin: '10px 0 0',
    color: cgiVisualTokens.colors.textPrimary,
    fontSize: 32,
    fontWeight: 950,
    lineHeight: 1,
  },

  metricValueGold: {
    margin: '10px 0 0',
    color: cgiVisualTokens.colors.gold,
    fontSize: 32,
    fontWeight: 950,
    lineHeight: 1,
  },

  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 24,
  },

  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },

  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },

  gridFive: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 14,
  },

  gridSix: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },

  tableWrap: {
    marginTop: 20,
    overflowX: 'auto',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 920,
  },

  th: {
    padding: '14px 16px',
    textAlign: 'left',
    color: cgiVisualTokens.colors.gold,
    background: cgiVisualTokens.colors.goldSoft,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },

  td: {
    padding: 16,
    color: '#dce1e8',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontSize: 13,
    lineHeight: 1.55,
    verticalAlign: 'top',
  },

  label: {
    display: 'grid',
    gap: 8,
    marginTop: 18,
    color: '#dde3ea',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },

  select: {
    width: '100%',
    borderRadius: 16,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    background: '#0d0d0d',
    color: '#ffffff',
    padding: '14px 16px',
    fontSize: 14,
    outline: 'none',
  },

  textarea: {
    minHeight: 120,
    resize: 'vertical',
    borderRadius: 18,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    background: '#0d0d0d',
    color: '#ffffff',
    padding: 16,
    fontSize: 14,
    lineHeight: 1.6,
    outline: 'none',
  },

  primaryButton: {
    marginTop: 20,
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: cgiVisualTokens.colors.goldStrong,
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
  },

  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0a0a0a',
    color: '#f8f6f1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },

  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: cgiVisualTokens.colors.black,
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
    color: '#ffffff',
    lineHeight: 1.7,
  },

  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: cgiVisualTokens.colors.gold,
    background: cgiVisualTokens.colors.goldSoft,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    fontWeight: 800,
  },

  emptyState: {
    padding: 18,
    borderRadius: 18,
    background: '#15110a',
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    color: cgiVisualTokens.colors.textSecondary,
    lineHeight: 1.6,
    fontSize: 14,
  },
}

export function mergeCGIStyles(
  ...styles: Array<CSSProperties | undefined | false>
): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean))
}