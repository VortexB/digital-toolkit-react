// Domain configuration — colors, icons, display names
// Update colors here to change the entire app's domain theming

export const DOMAIN_CONFIG = {
  technology: {
    key: 'technology',
    name: 'Technology',
    shortName: 'Technology',
    number: 1,
    color: '#3B82F6',       // Blue
    colorLight: '#DBEAFE',  // Light blue tint for backgrounds
    icon: '/imgs/domain-icons/tech.png',
  },
  value: {
    key: 'value',
    name: 'Value Proposition',
    shortName: 'Value',
    number: 2,
    color: '#14B8A6',       // Teal
    colorLight: '#CCFBF1',  // Light teal tint
    icon: '/imgs/domain-icons/value.png',
  },
  adopters: {
    key: 'adopters',
    name: 'Intended Adopters',
    shortName: 'Adopters',
    number: 3,
    color: '#F97316',       // Orange
    colorLight: '#ffe7c9ff',  // Light orange tint
    icon: '/imgs/domain-icons/adopters.png',
  },
  organizations: {
    key: 'organizations',
    name: 'Organizations',
    shortName: 'Organizations',
    number: 4,
    color: '#8B5CF6',       // Purple
    colorLight: '#EDE9FE',  // Light purple tint
    icon: '/imgs/domain-icons/organization.png',
  },
  external: {
    key: 'external',
    name: 'External Context',
    shortName: 'External',
    number: 5,
    color: '#c7ef44ff',       // Yellow
    colorLight: '#fefee2ff',  // Light yellow tint
    icon: '/imgs/domain-icons/external.png',
  },
};

// Domain keys in display order
export const DOMAIN_ORDER = ['technology', 'value', 'adopters', 'organizations', 'external'];

// Answer colors for navigation indicators (reversed logic)
export const ANSWER_COLORS = {
  no: '#22C55E',           // Green — good job
  not_applicable: '#4B5563', // Dark gray
  yes: '#EF4444',          // Red — needs attention
  do_not_know: '#F59E0B',  // Amber/yellow
  unanswered: '#d1d5db1e',   // Light gray
};

export const getDomainConfig = (key) => DOMAIN_CONFIG[key] || null;
