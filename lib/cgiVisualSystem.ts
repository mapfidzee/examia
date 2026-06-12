import type { CSSProperties } from 'react'

export const cgiVisualTokens = {
  colors: {
    black: '#050505',
    deepBlack: '#070707',
    panelBlack: '#090807',
    cardBlack: '#11100d',
    slate: '#111827',
    slateSoft: 'rgba(17,24,39,0.52)',
    gold: '#d6b25e',
    goldStrong: '#c9a227',
    goldMuted: '#9f8142',
    goldSoft: 'rgba(214,178,94,0.12)',
    goldSofter: 'rgba(214,178,94,0.075)',
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
    quiet: '0 14px 45px rgba(0,0,0,0.28)',
  },
  gradients: {
    page:
      'radial-gradient(circle at top left, rgba(214,178,94,0.1), transparent 34%), linear-gradient(180deg, #050505 0%, #0b0b0b 50%, #111827 100%)',
    panel:
      'linear-gradient(135deg, rgba(214,178,94,0.11), rgba(255,255,255,0.025))',
    emphasis:
      'linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38))',
    decision:
      'linear-gradient(135deg, rgba(214,178,94,0.2), rgba(255,255,255,0.04))',
    warning:
      'linear-gradient(135deg, rgba(214,178,94,0.16), rgba(0,0,0,0.54))',
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

  executivePageStack: {
    width: '100%',
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gap: 18,
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

  executiveHero: {
    display: 'grid',
    gap: 18,
    padding: 34,
    borderRadius: 30,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.18), rgba(255,255,255,0.035) 44%, rgba(0,0,0,0.35))',
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
    boxShadow: cgiVisualTokens.shadows.executive,
  },

  executiveHeroSplit: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.42fr) minmax(320px, 0.58fr)',
    gap: 24,
    padding: 34,
    borderRadius: 30,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.18), rgba(255,255,255,0.035) 44%, rgba(0,0,0,0.35))',
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
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

  executiveTitle: {
    margin: '12px 0 0',
    color: cgiVisualTokens.colors.textPrimary,
    fontSize: 'clamp(42px, 5.4vw, 78px)',
    lineHeight: 0.92,
    letterSpacing: '-0.075em',
    fontWeight: 950,
  },

  subtitle: {
    margin: '16px 0 0',
    maxWidth: 880,
    color: cgiVisualTokens.colors.textSecondary,
    fontSize: 15,
    lineHeight: 1.75,
  },

  executiveSubtitle: {
    margin: '18px 0 0',
    maxWidth: 920,
    color: cgiVisualTokens.colors.textSecondary,
    fontSize: 16,
    lineHeight: 1.78,
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

  decisionPanel: {
    padding: 30,
    borderRadius: 30,
    background: cgiVisualTokens.gradients.decision,
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
    boxShadow: cgiVisualTokens.shadows.card,
  },

  warningPanel: {
    padding: 28,
    borderRadius: 28,
    background: cgiVisualTokens.gradients.warning,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
  },

  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.15), rgba(17,24,39,0.44))',
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
  },

  briefPanel: {
    padding: 30,
    borderRadius: 30,
    background: '#030303',
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
    boxShadow: cgiVisualTokens.shadows.executive,
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

  quietCard: {
    padding: 20,
    borderRadius: 20,
    background: cgiVisualTokens.colors.slateSoft,
    border: '1px solid rgba(255,255,255,0.08)',
  },

  goldCard: {
    padding: 20,
    borderRadius: 20,
    background: cgiVisualTokens.colors.goldSoft,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
  },

  executiveMetricCard: {
    padding: 20,
    borderRadius: 22,
    background:
      'linear-gradient(180deg, rgba(214,178,94,0.1), rgba(255,255,255,0.035))',
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
    minHeight: 136,
  },

  executiveQuestionCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${cgiVisualTokens.colors.goldLineStrong}`,
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

  executivePanelTitle: {
    margin: '12px 0 0',
    color: cgiVisualTokens.colors.textPrimary,
    fontSize: 'clamp(28px, 3.2vw, 42px)',
    lineHeight: 1.05,
    letterSpacing: '-0.055em',
    fontWeight: 950,
  },

  bodyText: {
    margin: '8px 0 0',
    color: cgiVisualTokens.colors.textSecondary,
    lineHeight: 1.7,
    fontSize: 14,
  },

  executiveBodyText: {
    margin: '10px 0 0',
    color: cgiVisualTokens.colors.textSecondary,
    lineHeight: 1.75,
    fontSize: 15,
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

  executiveMetricValue: {
    margin: '10px 0 0',
    color: cgiVisualTokens.colors.gold,
    fontSize: 'clamp(34px, 4vw, 54px)',
    fontWeight: 950,
    lineHeight: 0.95,
    letterSpacing: '-0.05em',
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

  executiveMetricStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },

  executiveSignalStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },

  executiveChainPath: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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

  executiveSummaryBox: {
    marginTop: 20,
    padding: 24,
    borderRadius: 22,
    background: '#020202',
    color: '#f8f6f1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.75,
    overflowX: 'auto',
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
  },

  doctrinePanel: {
    padding: 24,
    borderRadius: 24,
    background: cgiVisualTokens.colors.deepBlack,
    border: `1px solid ${cgiVisualTokens.colors.goldLine}`,
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