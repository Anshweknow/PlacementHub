const iconStyle = { width: "1em", height: "1em", verticalAlign: "-0.15em", flexShrink: 0 };

export function Icon({ children, size = 18, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ ...iconStyle, width: size, height: size }} {...props}>{children}</svg>;
}

export const Briefcase = (p) => <Icon {...p}><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 12h18"/></Icon>;
export const BriefcaseBusiness = Briefcase;
export const Building2 = (p) => <Icon {...p}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v8"/><path d="M18 9h2a2 2 0 0 1 2 2v11"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></Icon>;
export const CalendarClock = (p) => <Icon {...p}><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M12 14v3l2 1"/></Icon>;
export const CalendarDays = CalendarClock;
export const Heart = ({ fill = "none", ...p }) => <Icon {...p} fill={fill}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></Icon>;
export const IndianRupee = (p) => <Icon {...p}><path d="M6 3h12M6 8h12M6 13l8 8M6 13h3a5 5 0 0 0 0-10"/></Icon>;
export const MapPin = (p) => <Icon {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
export const Search = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></Icon>;
export const SlidersHorizontal = (p) => <Icon {...p}><path d="M21 4H14M10 4H3M21 12H12M8 12H3M21 20H16M12 20H3"/><circle cx="12" cy="4" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="20" r="2"/></Icon>;
export const Sparkles = (p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17z"/></Icon>;
export const Users = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></Icon>;
export const Download = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Icon>;
export const Eye = (p) => <Icon {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>;
export const FileText = (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></Icon>;
export const Github = (p) => <Icon {...p}><path d="M15 22v-4a4 4 0 0 0-1-3c3 0 6-2 6-6a5 5 0 0 0-1.5-3.5c.1-.4.6-1.7-.2-3.5 0 0-1.3-.4-4 1.5a14 14 0 0 0-7 0C4.6 1.6 3.3 2 3.3 2c-.8 1.8-.3 3.1-.2 3.5A5 5 0 0 0 1.6 9c0 4 3 6 6 6a4 4 0 0 0-1 3v4"/></Icon>;
export const Globe = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></Icon>;
export const Linkedin = (p) => <Icon {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></Icon>;
export const Plus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const Save = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></Icon>;
export const ShieldCheck = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></Icon>;
export const Upload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>;
export const UserRound = (p) => <Icon {...p}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></Icon>;
export const MessageSquareText = (p) => <Icon {...p}><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 7h8M8 11h6"/></Icon>;
export const Target = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
export const Trophy = (p) => <Icon {...p}><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M5 5H3v3a4 4 0 0 0 4 4M19 5h2v3a4 4 0 0 1-4 4"/></Icon>;
export const UserCheck = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></Icon>;
export const XCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></Icon>;
