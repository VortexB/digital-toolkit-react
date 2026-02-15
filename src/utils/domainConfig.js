// Domain configuration — colors, icons, display names
// Update colors here to change the entire app's domain theming

export const DOMAIN_CONFIG = {
  technology: {
    key: 'technology',
    name: 'Technology',
    shortName: 'Technology',
    number: 1,
    color: '#8194E6',          
    colorLight: '#ced7ffff',    
    icon: '/imgs/domain-icons/tech.png',
    description: "This domain looks at the multiple complexities around technology, such as functionality of the technology itself, and the required knowledge and infrastructure to use it.",
  },
  value: {
    key: 'value',
    name: 'Value Proposition',
    shortName: 'Value',
    number: 2,
    color: '#B1E681',         
    colorLight: '#e3ffc9ff',     
    icon: '/imgs/domain-icons/value.png',
    description: "This domain concerns for whom a new technology generates values, including value to the patient, the developer, and the health system.",
  },
  adopters: {
    key: 'adopters',
    name: 'Intended Adopters',
    shortName: 'Adopters',
    number: 3,
    color: '#49998F',        
    colorLight: '#befff7ff',  
    icon: '/imgs/domain-icons/adopters.png',
    description: "This domain looks at the complexity of the adopter system, i.e., clinicians, staff, patients and carers who are expected to use the technology but who may refuse to use it or find that they are unable to use it.",
  },
  organizations: {
    key: 'organizations',
    name: 'Organizations',
    shortName: 'Organizations',
    number: 4,
    color: '#A481E6',         
    colorLight: '#e6d9ffff',    
    icon: '/imgs/domain-icons/organization.png',
    description: "This domain focuses on the organization’s capacity to innovate, readiness for a new innovation, funding decisions, potential disruption to existing routines, and the extent of additional work to implement changes.",
  },
  external: {
    key: 'external',
    name: 'External Context',
    shortName: 'External',
    number: 5,
    color: '#E6E081',        
    colorLight: '#fffcd6ff',   
    icon: '/imgs/domain-icons/external.png',
    description: "This domain concerns the wider system, how external social, political, technological, and economic context may affect the uptake of innovations.",
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
